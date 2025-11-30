const yup = require('yup');

const createProductValidator = yup.object().shape({
  name: yup
    .string()
    .required("نام محصول الزامی است")
    .min(3, "نام محصول باید حداقل ۳ کاراکتر باشد")
    .max(100, "نام محصول نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  slug: yup
    .string()
    .required("اسلاگ الزامی است")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ باید سازگار با URL باشد"),
  description: yup
    .string()
    .required("توضیحات محصول الزامی است")
    .max(1000, "توضیحات محصول نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"),
  positiveFeature: yup
    .string()
    .required("ویژگی مثبت الزامی است")
    .max(255, "ویژگی مثبت نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد"),
  category: yup
    .string()
    .required("دسته‌بندی الزامی است")
    .matches(/^[0-9a-fA-F]{24}$/, "دسته‌بندی باید یک ObjectId معتبر باشد"),
  brand: yup
    .string()
    .required("برند الزامی است")
    .trim(),
  badge: yup
    .string()
    .max(50, "بج نمی‌تواند بیشتر از ۵۰ کاراکتر باشد")
    .default(""),
  status: yup
    .string()
    .oneOf(["active", "inactive"])
    .default("inactive"),
  price: yup
    .number()
    .required("قیمت الزامی است")
    .min(0, "قیمت نمی‌تواند منفی باشد"),
  stock: yup
    .number()
    .required("موجودی الزامی است")
    .min(0, "موجودی نمی‌تواند منفی باشد"),
  originalPrice: yup
    .number()
    .min(0, "قیمت اصلی نمی‌تواند منفی باشد")
    .default(0),
  discount: yup
    .number()
    .min(0, "تخفیف نمی‌تواند منفی باشد")
    .max(100, "تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد")
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
  weight: yup
    .number()
    .min(0, "وزن نمی‌تواند منفی باشد")
    .default(0),
  ingredients: yup
    .string()
    .default(""),
  benefits: yup
    .string()
    .default(""),
  howToUse: yup
    .string()
    .default(""),
  hasWarranty: yup
    .boolean()
    .default(false),
  warrantyDuration: yup
    .number()
    .min(0, "مدت زمان گارانتی نمی‌تواند منفی باشد")
    .default(0),
  warrantyDescription: yup
    .string()
    .default(""),
  userReviews: yup
    .array()
    .of(yup.object().shape({
      user: yup.string().required("کاربر الزامی است"),
      rating: yup.number().min(1).max(5).required("امتیاز الزامی است"),
      comment: yup.string(),
      createdAt: yup.date().default(() => new Date())
    }))
    .default([]),
  recommended: yup
    .boolean()
    .default(false),
  relatedProducts: yup
    .array()
    .of(yup.string().matches(/^[0-9a-fA-F]{24}$/, "محصول مرتبط باید یک ObjectId معتبر باشد"))
    .default([]),
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
    .min(3, "نام محصول باید حداقل ۳ کاراکتر باشد")
    .max(100, "نام محصول نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  slug: yup
    .string()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ باید سازگار با URL باشد"),
  description: yup
    .string()
    .max(1000, "توضیحات محصول نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"),
  positiveFeature: yup
    .string()
    .max(255, "ویژگی مثبت نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد"),
  category: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "دسته‌بندی باید یک ObjectId معتبر باشد"),
  brand: yup
    .string()
    .trim(),
  badge: yup
    .string()
    .max(50, "بج نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),
  status: yup
    .string()
    .oneOf(["active", "inactive"]),
  price: yup
    .number()
    .min(0, "قیمت نمی‌تواند منفی باشد"),
  stock: yup
    .number()
    .min(0, "موجودی نمی‌تواند منفی باشد"),
  originalPrice: yup
    .number()
    .min(0, "قیمت اصلی نمی‌تواند منفی باشد"),
  discount: yup
    .number()
    .min(0, "تخفیف نمی‌تواند منفی باشد")
    .max(100, "تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد"),
  type: yup
    .string()
    .oneOf(['regular','discount','premium']),
  dealType: yup
    .string(),
  timeLeft: yup
    .string(),
  soldCount: yup
    .number()
    .min(0),
  totalCount: yup
    .number()
    .min(0),
  rating: yup
    .number()
    .min(0)
    .max(5),
  weight: yup
    .number()
    .min(0, "وزن نمی‌تواند منفی باشد"),
  ingredients: yup
    .string(),
  benefits: yup
    .string(),
  howToUse: yup
    .string(),
  hasWarranty: yup
    .boolean(),
  warrantyDuration: yup
    .number()
    .min(0, "مدت زمان گارانتی نمی‌تواند منفی باشد"),
  warrantyDescription: yup
    .string(),
  userReviews: yup
    .array()
    .of(yup.object().shape({
      user: yup.string(),
      rating: yup.number().min(1).max(5),
      comment: yup.string(),
      createdAt: yup.date()
    })),
  recommended: yup
    .boolean(),
  relatedProducts: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "محصول مرتبط باید یک ObjectId معتبر باشد"),
  isPrime: yup
    .boolean(),
  isPremium: yup
    .boolean(),
  features: yup
    .array()
    .of(yup.string()),
  image: yup
    .string(),
  images: yup
    .array()
    .of(yup.string()),
  seo: yup.object().shape({
    title: yup.string(),
    description: yup.string(),
    keywords: yup.array().of(yup.string())
  }),
});

module.exports = {
    createProductValidator,
    updateProductValidator
};
