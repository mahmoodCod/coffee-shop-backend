const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const createCommentValidator = yup.object().shape({
    productId: yup
    .string()
    .required("شناسه محصول الزامی است")
    .test("is-valid-object-id", "شناسه محصول نامعتبر است", (value) =>
      isValidObjectId(value)
    ),
    rating: yup.number().required("رتبه بندی الزامی است").min(1).max(5),

    content: yup
    .string()
    .max(1000, "محتوای نظر نمی تواند بیش از 1000 کاراکتر باشد"),
});

const updateCommentValidator = yup.object().shape({
    content: yup
    .string()
    .max(1000, "محتوای نظر نمی تواند بیش از 1000 کاراکتر باشد"),
  
    rating: yup.number().min(1).max(5),
});

const addReplyValidator = yup.object().shape({
    content: yup
    .string()
    .max(1000, "محتوای پاسخ نمی تواند بیش از 1000 کاراکتر باشد")
    .required("محتوای پاسخ الزامی است"),
});

const updateReplyValidator = yup.object().shape({
    content: yup
    .string()
    .max(1000, "محتوای پاسخ نمی تواند بیش از 1000 کاراکتر باشد"),
});

module.exports = {
    createCommentValidator,
    updateCommentValidator,
    addReplyValidator,
    updateReplyValidator,
};