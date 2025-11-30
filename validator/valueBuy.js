const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const allowedFeatures = ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"];
const allowedFilters = ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"];

const createValueBuyValidator  = yup.object().shape({
    product: yup
        .string()
        .required("شناسه محصول الزامی است")
        .test("is-objectid", "شناسه محصول معتبر نیست", (value) =>
            isValidObjectId(value)
        ),

    features: yup
        .array()
        .of(yup.string().oneOf(allowedFeatures))
        .required("آرایه ویژگی‌ها الزامی است")
        .default(["پیشنهاد شده"]),

    filters: yup
        .array()
        .of(yup.string().oneOf(allowedFilters))
        .required("آرایه فیلترها الزامی است")
        .default(["انتخاب اقتصادی"]),

    isActive: yup.boolean().default(true),
});

const updateValueBuyValidator = yup.object().shape({
    product: yup
        .string()
        .notRequired()
        .test("is-objectid", "شناسه محصول معتبر نیست", (value) => {
            if (!value) return true;
            return isValidObjectId(value);
        }),

    features: yup
        .array()
        .of(yup.string().oneOf(allowedFeatures))
        .notRequired(),

    filters: yup
        .array()
        .of(yup.string().oneOf(allowedFilters))
        .notRequired(),

    isActive: yup.boolean().notRequired(),
});

module.exports = {
    createValueBuyValidator,
    updateValueBuyValidator
};
