const yup = require('yup');

const addWishlistValidator = yup.object().shape({
    product: yup
    .string()
    .required("Product ID is required")
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid Product ID")
});