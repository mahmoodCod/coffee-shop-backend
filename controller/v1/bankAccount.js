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

        const validationData = {
            ...req.body,
            user: user.toString()
        };

        await createBankAccountValidator.validate(validationData, { abortEarly: false });

        const userExists = await User.findById(user);
        if (!userExists) {
            return errorResponse(res, 404, 'کاربر یافت نشد');
        }

        const existingCardNumber = await BankAccount.findOne({ cardNumber: cardNumber.trim() });
        if (existingCardNumber) {
            return errorResponse(res, 409, 'شماره کارت تکراری است');
        }

        const existingShebaNumber = await BankAccount.findOne({ shebaNumber: shebaNumber.trim() });
        if (existingShebaNumber) {
            return errorResponse(res, 409, 'شماره شبای وارد شده تکراری است');
        }

        const newBankAccount = await BankAccount.create({
            user,
            bankName: bankName.trim(),
            cardNumber: cardNumber.trim(),
            shebaNumber: shebaNumber.trim(),
            accountType: accountType || 'حساب جاری',
            isActive: isActive !== undefined ? isActive : true,
        });

        await newBankAccount.populate('user', 'name email phone');

        return successRespons(res, 201, {
            bankAccount: newBankAccount,
            message: 'حساب بانکی با موفقیت ایجاد شد'
        });

    } catch (err) {
        next(err);
    };
};

exports.getAllBankAccount = async (req,res,next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            isActive,
            accountType,
            bankName
        } = req.query;

        const filters = {};

        if (isActive !== undefined) {
            filters.isActive = isActive === 'true' || isActive === true;
        }

        if (accountType !== undefined) {
            if (['حساب جاری', 'پس‌انداز', 'دیگر'].includes(accountType)) {
                filters.accountType = accountType;
            }
        }

        if (bankName !== undefined) {
            filters.bankName = { $regex: bankName, $options: 'i' };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const bankAccounts = await BankAccount.find(filters)
            .populate('user', 'name email phone')
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

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

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه حساب بانکی معتبر نیست');
        }

        const bankAccount = await BankAccount.findById(id)
            .populate('user', 'name email phone')
            .select('-__v');

        if (!bankAccount) {
            return errorResponse(res, 404, 'حساب بانکی یافت نشد');
        }

        if (!user.roles.includes("ADMIN") && bankAccount.user._id.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'شما دسترسی لازم برای مشاهده این حساب بانکی را ندارید');
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

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه حساب بانکی معتبر نیست');
        }

        const existingBankAccount = await BankAccount.findById(id);
        if (!existingBankAccount) {
            return errorResponse(res, 404, 'حساب بانکی یافت نشد');
        }

        if (!user.roles.includes("ADMIN") && existingBankAccount.user.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'شما اجازه ویرایش این حساب بانکی را ندارید');
        }

        await updateBankAccountValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        if (bankName !== undefined) {
            updateData.bankName = bankName.trim();
        }

        if (cardNumber !== undefined) {
            const trimmedCardNumber = cardNumber.trim();
            if (trimmedCardNumber !== existingBankAccount.cardNumber) {
                const existingCardNumber = await BankAccount.findOne({ cardNumber: trimmedCardNumber });
                if (existingCardNumber) {
                    return errorResponse(res, 409, 'شماره کارت وارد شده تکراری است');
                }
            }
            updateData.cardNumber = trimmedCardNumber;
        }

        if (shebaNumber !== undefined) {
            const trimmedShebaNumber = shebaNumber.trim();
            if (trimmedShebaNumber !== existingBankAccount.shebaNumber) {
                const existingShebaNumber = await BankAccount.findOne({ shebaNumber: trimmedShebaNumber });
                if (existingShebaNumber) {
                    return errorResponse(res, 409, 'شماره شبا تکراری است');
                }
            }
            updateData.shebaNumber = trimmedShebaNumber;
        }

        if (accountType !== undefined) {
            updateData.accountType = accountType;
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        if (Object.keys(updateData).length === 0) {
            return errorResponse(res, 400, 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است');
        }

        const updatedBankAccount = await BankAccount.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('user', 'name email phone')
            .select('-__v');

        return successRespons(res, 200, {
            bankAccount: updatedBankAccount,
            message: 'حساب بانکی با موفقیت به‌روزرسانی شد'
        });

    } catch (err) {
        next(err);
    };
};

exports.deleteBankAccount = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه حساب بانکی معتبر نیست');
        }

        const bankAccount = await BankAccount.findById(id);

        if (!bankAccount) {
            return errorResponse(res, 404, 'حساب بانکی یافت نشد');
        }

        if (!user.roles.includes("ADMIN") && bankAccount.user.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'شما مجوز حذف این حساب بانکی را ندارید');
        }

        const deletedBankAccount = await BankAccount.findByIdAndDelete(id);

        return successRespons(res, 200, {
            message: 'حساب بانکی با موفقیت حذف شد',
            bankAccount: deletedBankAccount
        });

    } catch (err) {
        next(err);
    };
};
