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