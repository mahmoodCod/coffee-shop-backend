const yup = require('yup');

const addWishlistValidator = yup.object().shape({
    product: yup
    .string()
    .required("Product ID is required")
});

module.exports = {
    addWishlistValidator
};