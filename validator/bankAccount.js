const yup = require('yup');
const { isValidObjectId } = require('mongoose');

// Regular expressions
const cardNumberRegex = /^[0-9]{16}$/; // 16 digit card number
const shebaRegex = /^IR[0-9]{24}$/; // Sheba IBAN: IR + 24 digits

const createBankAccountValidator = yup.object().shape({
    user: yup
        .string()
        .required("کاربر مورد نیاز است")
        .test("عینی است", "شناسه کاربری نامعتبر است", isValidObjectId),

    bankName: yup
        .string()
        .required("نام بانک الزامی است")
        .min(2, "bankName باید حداقل 2 کاراکتر باشد"),

    cardNumber: yup
        .string()
        .required("شماره کارت الزامی است")
        .matches(cardNumberRegex, "شماره کارت باید دقیقا 16 رقمی باشد"),

    shebaNumber: yup
        .string()
        .required("shebaNumber مورد نیاز است")
        .matches(shebaRegex, "shebaNumber باید با IR شروع شود و بعد از آن شامل 24 رقم باشد"),

    accountType: yup
        .string()
        .oneOf(['حساب جاری', 'پس‌انداز', 'دیگر'], "نوع حساب نامعتبر است")
        .default('حساب جاری'),

    isActive: yup.boolean().default(true)
});

const updateBankAccountValidator = yup.object().shape({
    bankName: yup
        .string()
        .min(2, "bankName باید حداقل 2 کاراکتر باشد")
        .optional(),

    cardNumber: yup
        .string()
        .matches(cardNumberRegex, "شماره کارت باید دقیقا 16 رقمی باشد")
        .optional(),

    shebaNumber: yup
        .string()
        .matches(shebaRegex, "shebaNumber باید با IR شروع شود و بعد از آن شامل 24 رقم باشد")
        .optional(),

    accountType: yup
        .string()
        .oneOf(['حساب جاری', 'پس‌انداز', 'دیگر'], "نوع حساب نامعتبر است")
        .optional(),

    isActive: yup.boolean().optional()
});

module.exports = {
    createBankAccountValidator,
    updateBankAccountValidator
};