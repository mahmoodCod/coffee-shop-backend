const yup = require('yup');
const { isValidObjectId } = require("mongoose");

// Validate MongoDB ObjectId
const objectIdValidation = (value) => !value || isValidObjectId(value);

const checkoutItemValidator = yup.object().shape({
    product: yup
        .string()
        .required("محصول مورد نیاز است")
        .test("عینی است", "شناسه محصول نامعتبر است", objectIdValidation),

    quantity: yup
        .number()
        .required("شناسه محصول نامعتبر است")
        .min(1, "مقدار باید حداقل 1 باشد"),

    priceAtTimeOfPurchase: yup
        .number()
        .required("PriceAtTimeOfPurchase مورد نیاز است")
        .min(0, "priceAtTimeOfPurchase باید >= 0 باشد"),
});

const createCheckoutValidator = yup.object().shape({
    user: yup
        .string()
        .test("عینی هست", "شناسه کاربری نامعتبر است", objectIdValidation),

    items: yup
        .array()
        .of(checkoutItemValidator)
        .min(1, "تسویه حساب باید حداقل 1 مورد داشته باشد"),
        // .required("items are required"),

    // shippingAddress: checkoutItemValidator.required(),

    shippingAddressId: yup
        .string()
        .required("آدرس حمل و نقل الزامی است")
        .test("عینی هست", "شناسه آدرس نامعتبر است", objectIdValidation),

    authority: yup
        .string()
        // .required("authority is required")
        .min(5, "اعتبار باید حداقل 5 کاراکتر باشد"),

    discountCode: yup
        .string()
        .nullable()
        .notRequired(),

    discount: yup.object().shape({
        percentage: yup.number().min(0).max(100).notRequired(),
        amount: yup.number().min(0).notRequired(),
    }),

    totalPriceAfterDiscount: yup
        .number()
        .min(0)
        .notRequired(),

    expiresAt: yup
        .date()
        .notRequired(),
});

const updateCheckoutValidator = yup.object().shape({
    items: yup
        .array()
        .of(checkoutItemValidator)
        .notRequired(),

    shippingAddress: checkoutItemValidator.notRequired(),

    authority: yup
        .string()
        .min(5, "اعتبار باید حداقل 5 کاراکتر باشد")
        .notRequired(),

    discountCode: yup
        .string()
        .nullable()
        .notRequired(),

    discount: yup.object().shape({
        percentage: yup.number().min(0).max(100).notRequired(),
        amount: yup.number().min(0).notRequired(),
    }).notRequired(),

    totalPriceAfterDiscount: yup
        .number()
        .min(0)
        .notRequired(),

    expiresAt: yup
        .date()
        .notRequired(),
});

module.exports = {
    createCheckoutValidator,
    updateCheckoutValidator,
};