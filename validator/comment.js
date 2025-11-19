const yup = require('yup');

const createCommentValidator = yup.object().shape({
    productId: yup
    .string()
    .required("Product ID is required")
    .test("is-valid-object-id", "Invalid product ID", (value) =>
      isValidObjectId(value)
    ),
    rating: yup.number().required("Rating is required").min(1).max(5),

    content: yup
    .string()
    .max(1000, "Comment content cannot exceed 1000 characters"),
});

const updateCommentValidator = yup.object().shape({
    content: yup
      .string()
      .max(1000, "Comment content cannot exceed 1000 characters"),
  
    rating: yup.number().min(1).max(5),
});