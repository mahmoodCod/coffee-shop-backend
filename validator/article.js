const yup = require('yup');

const createArticleValidator = yup.object().shape({
    title: yup
        .string()
        .required("Article title is required")
        .min(3, "Title must be at least 3 characters long")
        .max(150, "Title cannot exceed 150 characters"),

    excerpt: yup
        .string()
        .required("Article excerpt is required")
        .max(300, "Excerpt cannot exceed 300 characters"),

    discription: yup
        .string()
        .required("Short description is required")
        .max(500, "Short description cannot exceed 500 characters"),
});