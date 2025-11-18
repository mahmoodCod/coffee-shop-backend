const yup = require('yup');

const createProductValidator = yup.object().shape({
    name: yup
    .string()
    .required("Product name is required")
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name cannot exceed 100 characters"),
    slug: yup
    .string()
    .required("Slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
    description: yup
    .string()
    .required("Product description is required")
    .max(1000, "Product description cannot exceed 1000 characters"),
    positiveFeature: yup
    .string()
    .required("Positive feature is required")
    .max(255, "Positive feature cannot exceed 255 characters"),
    category: yup
    .string()
    .required("Category is required")
    .matches(/^[0-9a-fA-F]{24}$/, "Category must be a valid ObjectId"),
    badge: yup
    .string()
    .required("Badge is required")
    .max(50, "Badge cannot exceed 50 characters"),
    status: yup
    .string()
    .oneOf(["active", "inactive"])
    .default("inactive"),
});