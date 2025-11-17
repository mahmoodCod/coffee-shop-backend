const yup = require('yup');

const categorySchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .trim()
    .max(100, 'Category name cannot exceed 100 characters'),

  slug: yup
    .string()
    .required('Slug is required')
    .trim()
    .lowercase()
    .matches(/^[a-z0-9\u0600-\u06FF-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),

  description: yup
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters'),

  image: yup
    .string()
    .required('Image is required')
    .url('Image must be a valid URL'),

  color: yup
    .string()
    .required('Color is required')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color'),

  icon: yup
    .string()
    .trim(),

  parent: yup
    .string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, 'Parent must be a valid ObjectId'),

  order: yup
    .number()
    .integer()
    .min(0, 'Order must be a positive number')
    .default(0),

  isActive: yup
    .boolean()
    .default(true),

  showOnHomepage: yup
    .boolean()
    .default(false),

  seo: yup.object({
    metaTitle: yup
      .string()
      .max(70, 'Meta title cannot exceed 70 characters'),

    metaDescription: yup
      .string()
      .max(160, 'Meta description cannot exceed 160 characters'),

    metaKeywords: yup
      .array()
      .of(yup.string())
  }),

  productsCount: yup
    .number()
    .integer()
    .min(0, 'Products count must be a positive number')
    .default(0)
});