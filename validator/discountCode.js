const yup = require('yup');

const createDiscountCodeValidator = yup.object().shape({
    code: yup
        .string()
        .trim()
        .required("کد تخفیف الزامی است"),

    percentage: yup
        .number()
        .required("درصد لازم است")
        .min(1, "درصد باید حداقل 1٪ باشد")
        .max(100, "درصد نمی تواند از 100٪ تجاوز کند"),

    expiresAt: yup
        .date()
        .required("تاریخ انقضا الزامی است")
        .min(new Date(), "تاریخ انقضا باید در آینده باشد"),

    usageLimit: yup
        .number()
        .min(1, "محدودیت استفاده باید حداقل 1 باشد")
        .default(1),

    isActive: yup
        .boolean()
        .default(true),
});

const updateDiscountCodeValidator = yup.object().shape({
    code: yup
        .string()
        .trim(),

    percentage: yup
        .number()
        .min(1, "درصد باید حداقل 1٪ باشد")
        .max(100, "درصد نمی تواند از 100٪ تجاوز کند"),

    expiresAt: yup
        .date()
        .min(new Date(), "تاریخ انقضا باید در آینده باشد"),
    usageLimit: yup
        .number()
        .min(1, "محدودیت استفاده باید حداقل 1 باشد"),

    isActive: yup
        .boolean(),
});

const applyDiscountCodeValidator = yup.object().shape({
    code: yup
        .string()
        .trim()
        .required("کد تخفیف الزامی است"),
});

module.exports = {
    createDiscountCodeValidator,
    updateDiscountCodeValidator,
    applyDiscountCodeValidator
};