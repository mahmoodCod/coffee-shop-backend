const yup = require('yup');

const categorySchema = yup.object({
  name: yup
    .string()
    .required('نام الزامی است')
    .trim()
    .max(100, 'نام دسته نباید از 100 کاراکتر بیشتر باشد'),

  slug: yup
    .string()
    .required('Slug مورد نیاز است')
    .trim()
    .lowercase()
    .matches(/^[a-z0-9\u0600-\u06FF-]+$/, 'Slug باید فقط شامل حروف کوچک، اعداد و خط فاصله باشد'),

  description: yup
    .string()
    .trim()
    .max(500, 'توضیحات نمی تواند بیش از 500 کاراکتر باشد'),

  images: yup
    .string()
    .nullable()
    .notRequired(),

  color: yup
    .string()
    .nullable()
    .notRequired()
    .test('فرمت رنگی', 'رنگ باید یک رنگ هگز معتبر باشد', function(value) {
      if (!value || value === null || value.length === 0) {
        return true; // Optional field, skip validation if empty
      }
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
    }),

  icon: yup
    .string()
    .trim(),

  parent: yup
    .string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, 'والد باید یک ObjectId معتبر باشد'),

  order: yup
    .number()
    .integer()
    .min(0, 'سفارش باید یک عدد مثبت باشد')
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
      .max(70, 'عنوان متا نمی تواند بیش از 70 کاراکتر باشد'),

    metaDescription: yup
      .string()
      .max(160, 'توضیحات متا نباید بیش از 160 کاراکتر باشد'),

    metaKeywords: yup
      .array()
      .of(yup.string())
  }),

  productsCount: yup
    .number()
    .integer()
    .min(0, 'تعداد محصولات باید یک عدد مثبت باشد')
    .default(0)
});

const categoryUpdateSchema = yup.object({
    name: yup
      .string()
      .trim()
      .max(100, 'نام دسته نباید از 100 کاراکتر بیشتر باشد'),
  
    slug: yup
      .string()
      .trim()
      .lowercase()
      .matches(/^[a-z0-9\u0600-\u06FF-]+$/, 'Slug باید فقط شامل حروف کوچک، اعداد و خط فاصله باشد'),
  
    description: yup
      .string()
      .trim()
      .max(500, 'توضیحات نمی تواند بیش از 500 کاراکتر باشد'),
  
    images: yup
      .string()
      .nullable()
      .notRequired(),
  
    color: yup
      .string()
      .nullable()
      .notRequired()
      .test('فرمت رنگی', 'رنگ باید یک رنگ هگز معتبر باشد', function(value) {
        if (!value || value === null || value.length === 0) {
          return true;
        }
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
      }),
  
    icon: yup
      .string()
      .trim(),
  
    parent: yup
      .string()
      .nullable()
      .matches(/^[0-9a-fA-F]{24}$/, 'والد باید یک ObjectId معتبر باشد'),
  
    order: yup
      .number()
      .integer()
      .min(0, 'سفارش باید یک عدد مثبت باشد'),
  
    isActive: yup
      .boolean(),
  
    showOnHomepage: yup
      .boolean(),
  
    seo: yup.object({
      metaTitle: yup
        .string()
        .max(70, 'عنوان متا نباید بیش از 70 کاراکتر باشد'),
  
      metaDescription: yup
        .string()
        .max(160, 'توضیحات متا نباید بیش از 160 کاراکتر باشد'),
  
      metaKeywords: yup
        .array()
        .of(yup.string())
    }),
  
    productsCount: yup
      .number()
      .integer()
      .min(0, 'تعداد محصولات باید یک عدد مثبت باشد')
  });
  
  module.exports = {
    categorySchema,
    categoryUpdateSchema
  };