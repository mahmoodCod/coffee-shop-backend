const { createBankAccountValidator } = require('../../validator/bankAccount');
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
        const user = req.user._id;
        const { 
            page = 1, 
            limit = 10, 
            isActive,
            accountType,
            bankName
        } = req.query;

        // Build filters - only get current user's bank accounts
        const filters = { user };

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

    } catch (err) {
        next (err);
    };
};

exports.updateBankAccount = async (req,res,next) => {
    try {

    } catch (err) {
        next (err);
    };
};

exports.deleteBankAccount = async (req,res,next) => {
    try {

    } catch (err) {
        next (err);
    };
};