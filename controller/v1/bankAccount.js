const { createBankAccountValidator, updateBankAccountValidator } = require('../../validator/bankAccount');
const { errorResponse, successRespons } = require('../../helpers/responses');
const BankAccount = require('../../model/BankAccount');
const User = require('../../model/User');
const { isValidObjectId } = require('mongoose');
const { createPaginationData } = require('../../utils');

exports.createBankAccount = async (req,res,next) => {
    try {
        const user = req.user._id;
        const { bankName, cardNumber, shebaNumber, accountType, isActive } = req.body;

        // Prepare validation data (user from req.user, not from body)
        const validationData = {
            ...req.body,
            user: user.toString()
        };

        // Validate request body
        await createBankAccountValidator.validate(validationData, { abortEarly: false });

        // Check if user exists
        const userExists = await User.findById(user);
        if (!userExists) {
            return errorResponse(res, 404, 'User not found');
        }

        // Check if cardNumber already exists
        const existingCardNumber = await BankAccount.findOne({ cardNumber: cardNumber.trim() });
        if (existingCardNumber) {
            return errorResponse(res, 409, 'Card number already exists');
        }

        // Check if shebaNumber already exists
        const existingShebaNumber = await BankAccount.findOne({ shebaNumber: shebaNumber.trim() });
        if (existingShebaNumber) {
            return errorResponse(res, 409, 'Sheba number already exists');
        }

        // Create BankAccount
        const newBankAccount = await BankAccount.create({
            user,
            bankName: bankName.trim(),
            cardNumber: cardNumber.trim(),
            shebaNumber: shebaNumber.trim(),
            accountType: accountType || 'حساب جاری',
            isActive: isActive !== undefined ? isActive : true,
        });

        // Populate user details
        await newBankAccount.populate('user', 'name email phone');

        return successRespons(res, 201, {
            bankAccount: newBankAccount,
            message: 'Bank account created successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getAllBankAccount = async (req,res,next) => {
    try {
        // const user = req.user._id;
        const { 
            page = 1, 
            limit = 10, 
            isActive,
            accountType,
            bankName
        } = req.query;

        // Build filters - only get current user's bank accounts
        const filters = {}; // user **

        // Filter by isActive status
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true' || isActive === true;
        }

        // Filter by accountType
        if (accountType !== undefined) {
            if (['حساب جاری', 'پس‌انداز', 'دیگر'].includes(accountType)) {
                filters.accountType = accountType;
            }
        }

        // Filter by bankName (case-insensitive search)
        if (bankName !== undefined) {
            filters.bankName = { $regex: bankName, $options: 'i' };
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find bank accounts with filters, pagination, and populate user
        const bankAccounts = await BankAccount.find(filters)
            .populate('user', 'name email phone')
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

        // Count total bank accounts with filters
        const totalBankAccounts = await BankAccount.countDocuments(filters);

        return successRespons(res, 200, {
            bankAccounts,
            pagination: createPaginationData(pageNum, limitNum, totalBankAccounts, 'BankAccounts'),
        });

    } catch (err) {
        next(err);
    };
};

exports.getOneBankAccount = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Validate BankAccount ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid BankAccount ID');
        }

        // Find BankAccount by ID and populate user
        const bankAccount = await BankAccount.findById(id)
            .populate('user', 'name email phone')
            .select('-__v');

        // Check if BankAccount exists
        if (!bankAccount) {
            return errorResponse(res, 404, 'BankAccount not found');
        }

        // Check if user has access (only owner or ADMIN)
        if (!user.roles.includes("ADMIN") && bankAccount.user._id.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'You do not have access to this bank account');
        }

        return successRespons(res, 200, {
            bankAccount,
        });

    } catch (err) {
        next(err);
    };
};

exports.updateBankAccount = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { bankName, cardNumber, shebaNumber, accountType, isActive } = req.body;

        // Validate BankAccount ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid BankAccount ID');
        }

        // Find BankAccount
        const existingBankAccount = await BankAccount.findById(id);
        if (!existingBankAccount) {
            return errorResponse(res, 404, 'BankAccount not found');
        }

        // Check if user has access (only owner or ADMIN)
        if (!user.roles.includes("ADMIN") && existingBankAccount.user.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'You do not have access to this bank account');
        }

        // Validate request body
        await updateBankAccountValidator.validate(req.body, { abortEarly: false });

        // Build update object (only update provided fields)
        const updateData = {};

        // Update bankName if provided
        if (bankName !== undefined) {
            updateData.bankName = bankName.trim();
        }

        // Check if cardNumber is being updated
        if (cardNumber !== undefined) {
            const trimmedCardNumber = cardNumber.trim();
            
            // Check if cardNumber already exists (excluding current bank account)
            if (trimmedCardNumber !== existingBankAccount.cardNumber) {
                const existingCardNumber = await BankAccount.findOne({ cardNumber: trimmedCardNumber });
                if (existingCardNumber) {
                    return errorResponse(res, 409, 'Card number already exists');
                }
            }
            updateData.cardNumber = trimmedCardNumber;
        }

        // Check if shebaNumber is being updated
        if (shebaNumber !== undefined) {
            const trimmedShebaNumber = shebaNumber.trim();
            
            // Check if shebaNumber already exists (excluding current bank account)
            if (trimmedShebaNumber !== existingBankAccount.shebaNumber) {
                const existingShebaNumber = await BankAccount.findOne({ shebaNumber: trimmedShebaNumber });
                if (existingShebaNumber) {
                    return errorResponse(res, 409, 'Sheba number already exists');
                }
            }
            updateData.shebaNumber = trimmedShebaNumber;
        }

        // Update accountType if provided
        if (accountType !== undefined) {
            updateData.accountType = accountType;
        }

        // Update isActive if provided
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return errorResponse(res, 400, 'No fields to update');
        }

        // Update BankAccount
        const updatedBankAccount = await BankAccount.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('user', 'name email phone')
            .select('-__v');

        return successRespons(res, 200, {
            bankAccount: updatedBankAccount,
            message: 'Bank account updated successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.deleteBankAccount = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Validate BankAccount ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid BankAccount ID');
        }

        // Find BankAccount
        const bankAccount = await BankAccount.findById(id);

        // Check if BankAccount exists
        if (!bankAccount) {
            return errorResponse(res, 404, 'BankAccount not found');
        }

        // Check if user has access (only owner or ADMIN)
        if (!user.roles.includes("ADMIN") && bankAccount.user.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'You do not have access to this bank account');
        }

        // Delete BankAccount
        const deletedBankAccount = await BankAccount.findByIdAndDelete(id);

        return successRespons(res, 200, {
            message: 'Bank account deleted successfully',
            bankAccount: deletedBankAccount
        });

    } catch (err) {
        next(err);
    };
};