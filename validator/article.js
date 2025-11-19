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
    
    body: yup
        .string()
        .required("Article body is required"),

    cover: yup
        .string()
        .required("Cover image is required"),

    href: yup
        .string()
        .required("Article link is required")
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Link must be URL-friendly"),

    category: yup
        .string()
        .required("Category is required"),

    creator: yup
        .string()
        .required("Creator ID is required"),
});