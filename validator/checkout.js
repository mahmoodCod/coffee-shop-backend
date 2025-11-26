const yup = require('yup');
const { isValidObjectId } = require("mongoose");

// Validate MongoDB ObjectId
const objectIdValidation = (value) => !value || isValidObjectId(value);

const checkoutItemValidator = yup.object().shape({
    product: yup
        .string()
        .required("product is required")
        .test("is-objectid", "Invalid product ID", objectIdValidation),

    quantity: yup
        .number()
        .required("quantity is required")
        .min(1, "quantity must be at least 1"),

    priceAtTimeOfPurchase: yup
        .number()
        .required("priceAtTimeOfPurchase is required")
        .min(0, "priceAtTimeOfPurchase must be >= 0"),
});

const createCheckoutValidator = yup.object().shape({
    user: yup
        .string()
        .test("is-objectid", "Invalid user ID", objectIdValidation),

    items: yup
        .array()
        .of(checkoutItemValidator)
        .min(1, "Checkout must have at least 1 item"),
        // .required("items are required"),

    // shippingAddress: checkoutItemValidator.required(),

    shippingAddressId: yup
        .string()
        .required("Shipping address is required")
        .test("is-objectid", "Invalid address ID", objectIdValidation),

    authority: yup
        .string()
        // .required("authority is required")
        .min(5, "authority must be at least 5 characters"),

    discountCode: yup
        .string()
        .nullable()
        .notRequired(),

    discount: yup.object().shape({
        percentage: yup.number().min(0).max(100).notRequired(),
        amount: yup.number().min(0).notRequired(),
    }),

    totalPriceAfterDiscount: yup
        .number()
        .min(0)
        .notRequired(),

    expiresAt: yup
        .date()
        .notRequired(),
});

const updateCheckoutValidator = yup.object().shape({
    items: yup
        .array()
        .of(checkoutItemValidator)
        .notRequired(),

    shippingAddress: checkoutItemValidator.notRequired(),

    authority: yup
        .string()
        .min(5, "authority must be at least 5 characters")
        .notRequired(),

    discountCode: yup
        .string()
        .nullable()
        .notRequired(),

    discount: yup.object().shape({
        percentage: yup.number().min(0).max(100).notRequired(),
        amount: yup.number().min(0).notRequired(),
    }).notRequired(),

    totalPriceAfterDiscount: yup
        .number()
        .min(0)
        .notRequired(),

    expiresAt: yup
        .date()
        .notRequired(),
});

module.exports = {
    createCheckoutValidator,
    updateCheckoutValidator,
};