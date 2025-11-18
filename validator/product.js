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
    price: yup
    .number()
    .required("Price is required")
    .min(0, "Price cannot be negative"),
    stock: yup
    .number()
    .required("Stock is required")
    .min(0, "Stock cannot be negative"),
    originalPrice: yup
    .number()
    .min(0, "Original price cannot be negative")
    .default(0),
    discount: yup
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100")
    .default(0),
    type: yup
    .string()
    .oneOf(['regular','discount','premium'])
    .default('regular'),
    dealType: yup
    .string()
    .default(''),

  timeLeft: yup
    .string()
    .default(''),

  soldCount: yup
    .number()
    .min(0)
    .default(0),
    totalCount: yup
    .number()
    .min(0)
    .default(0),

  rating: yup
    .number()
    .min(0)
    .max(5)
    .default(0),
    reviews: yup
    .number()
    .min(0)
    .default(0),

  isPrime: yup
    .boolean()
    .default(false),

  isPremium: yup
    .boolean()
    .default(false),
    features: yup
    .array()
    .of(yup.string())
    .default([]),
    image: yup
    .string()
    .default('/images/default-product.jpg'),

  images: yup
    .array()
    .of(yup.string())
    .default([]),
  seo: yup.object().shape({
        title: yup.string(),
        description: yup.string(),
        keywords: yup.array().of(yup.string()).default([])
    }).default({}),
});

const updateProductValidator = yup.object().shape({
  name: yup
    .string()
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name cannot exceed 100 characters"),

  slug: yup
    .string()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),

  description: yup
    .string()
    .max(1000, "Product description cannot exceed 1000 characters"),
});