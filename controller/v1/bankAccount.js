const { createBankAccountValidator } = require('../../validator/bankAccount');
const { errorResponse, successRespons } = require('../../helpers/responses');
const BankAccount = require('../../model/BankAccount');
const User = require('../../model/User');
const { isValidObjectId } = require('mongoose');

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

    } catch (err) {
        next (err);
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