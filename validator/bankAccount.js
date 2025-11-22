const yup = require('yup');
const { isValidObjectId } = require('mongoose');

// Regular expressions
const cardNumberRegex = /^[0-9]{16}$/; // 16 digit card number
const shebaRegex = /^IR[0-9]{24}$/; // Sheba IBAN: IR + 24 digits

const createBankAccountValidator = yup.object().shape({
    user: yup
        .string()
        .required("user is required")
        .test("is-objectid", "Invalid user ID", isValidObjectId),

    bankName: yup
        .string()
        .required("bankName is required")
        .min(2, "bankName must be at least 2 characters"),

    cardNumber: yup
        .string()
        .required("cardNumber is required")
        .matches(cardNumberRegex, "cardNumber must be exactly 16 digits"),

    shebaNumber: yup
        .string()
        .required("shebaNumber is required")
        .matches(shebaRegex, "shebaNumber must start with IR and contain 24 digits after it"),

    accountType: yup
        .string()
        .oneOf(['حساب جاری', 'پس‌انداز', 'دیگر'], "Invalid accountType")
        .default('حساب جاری'),

    isActive: yup.boolean().default(true)
});

const updateBankAccountValidator = yup.object().shape({
    bankName: yup
        .string()
        .min(2, "bankName must be at least 2 characters")
        .optional(),

    cardNumber: yup
        .string()
        .matches(cardNumberRegex, "cardNumber must be exactly 16 digits")
        .optional(),

    shebaNumber: yup
        .string()
        .matches(shebaRegex, "shebaNumber must start with IR and contain 24 digits after it")
        .optional(),

    accountType: yup
        .string()
        .oneOf(['حساب جاری', 'پس‌انداز', 'دیگر'], "Invalid accountType")
        .optional(),

    isActive: yup.boolean().optional()
});

module.exports = {
    createBankAccountValidator,
    updateBankAccountValidator
};