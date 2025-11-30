const yup = require('yup');

const addWishlistValidator = yup.object().shape({
    product: yup
    .string()
    .required("شناسه محصول الزامی است")
});

module.exports = {
    addWishlistValidator
};