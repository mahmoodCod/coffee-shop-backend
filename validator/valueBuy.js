const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const allowedFeatures = ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"];
const allowedFilters = ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"];

const createValueBuyValidator  = yup.object().shape({
    product: yup
        .string()
        .required("Product ID is required")
        .test("is-objectid", "Invalid Product ID", (value) =>
            isValidObjectId(value)
        ),

    features: yup
        .array()
        .of(yup.string().oneOf(allowedFeatures))
        .required("Features array is required")
        .default(["پیشنهاد شده"]),

    filters: yup
        .array()
        .of(yup.string().oneOf(allowedFilters))
        .required("Filters array is required")
        .default(["انتخاب اقتصادی"]),

    isActive: yup.boolean().default(true),
});

const updateValueBuyValidator = yup.object().shape({
    product: yup
        .string()
        .notRequired()
        .test("is-objectid", "Invalid Product ID", (value) => {
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