const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const addToCartValidator = yup.object({
    productId: yup
      .string()
      .required("شناسه محصول الزامی است")
      .test("is-valid-object-id", "شناسه محصول نامعتبر است", (value) =>
        isValidObjectId(value)
    ),
    quantity: yup.number().required("مقدار مورد نیاز است").positive().integer(),
});

const removeFromCartValidator = yup.object({
    productId: yup
      .string()
      .required("شناسه محصول الزامی است")
      .test("is-valid-object-id", "شناسه محصول نامعتبر است", (value) =>
        isValidObjectId(value)
    ),
});

module.exports = {
    addToCartValidator,
    removeFromCartValidator,
};