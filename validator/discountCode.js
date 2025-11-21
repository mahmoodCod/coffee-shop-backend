const yup = require('yup');

const createDiscountCodeValidator = yup.object().shape({
    code: yup
        .string()
        .trim()
        .required("Discount code is required"),

    percentage: yup
        .number()
        .required("Percentage is required")
        .min(1, "Percentage must be at least 1%")
        .max(100, "Percentage cannot exceed 100%"),

    expiresAt: yup
        .date()
        .required("Expiration date is required")
        .min(new Date(), "Expiration date must be in the future"),

    usageLimit: yup
        .number()
        .min(1, "Usage limit must be at least 1")
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
        .min(1, "Percentage must be at least 1%")
        .max(100, "Percentage cannot exceed 100%"),

    expiresAt: yup
        .date()
        .min(new Date(), "Expiration date must be in the future"),

    usageLimit: yup
        .number()
        .min(1, "Usage limit must be at least 1"),

    isActive: yup
        .boolean(),
});

const applyDiscountCodeValidator = yup.object().shape({
    code: yup
        .string()
        .trim()
        .required("Discount code is required"),
});

module.exports = {
    createDiscountCodeValidator,
    updateDiscountCodeValidator,
    applyDiscountCodeValidator
};