const yup = require("yup");
const { isValidObjectId } = require("mongoose");

// Validate MongoDB ObjectId
const objectIdValidation = (value) =>
    !value || isValidObjectId(value);

const createTicketValidator = yup.object().shape({
    departmentId: yup
        .string()
        .required("شناسه دپارتمان الزامی است")
        .test("is-objectid", "شناسه دپارتمان معتبر نیست", objectIdValidation),

    departmentSubId: yup
        .string()
        .required("شناسه زیرمجموعه دپارتمان الزامی است")
        .test("is-objectid", "شناسه زیرمجموعه دپارتمان معتبر نیست", objectIdValidation),

    priority: yup
        .string()
        .oneOf(["low", "medium", "high"], "مقدار اولویت معتبر نیست")
        .required("اولویت الزامی است"),

    title: yup
        .string()
        .required("عنوان الزامی است")
        .min(3, "عنوان باید حداقل ۳ کاراکتر باشد"),

    body: yup
        .string()
        .required("متن تیکت الزامی است")
        .min(5, "متن باید حداقل ۵ کاراکتر باشد"),

    user: yup
        .string()
        .required("شناسه کاربر الزامی است")
        .test("is-objectid", "شناسه کاربر معتبر نیست", objectIdValidation),

    product: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "شناسه محصول معتبر نیست", objectIdValidation),

    parent: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "شناسه والد معتبر نیست", objectIdValidation),

    isAnswered: yup
        .boolean()
        .notRequired(),

    status: yup
        .string()
        .oneOf(["open", "answered", "closed"], "وضعیت معتبر نیست")
        .notRequired(),
});

const updateTicketValidator = yup.object().shape({
    departmentId: yup
        .string()
        .notRequired()
        .test("is-objectid", "شناسه دپارتمان معتبر نیست", objectIdValidation),

    departmentSubId: yup
        .string()
        .notRequired()
        .test("is-objectid", "شناسه زیرمجموعه دپارتمان معتبر نیست", objectIdValidation),

    priority: yup
        .string()
        .oneOf(["low", "medium", "high"], "مقدار اولویت معتبر نیست")
        .notRequired(),

    title: yup
        .string()
        .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
        .notRequired(),

    body: yup
        .string()
        .min(5, "متن باید حداقل ۵ کاراکتر باشد")
        .notRequired(),

    product: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "شناسه محصول معتبر نیست", objectIdValidation),

    parent: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "شناسه والد معتبر نیست", objectIdValidation),

    isAnswered: yup
        .boolean()
        .notRequired(),

    status: yup
        .string()
        .oneOf(["open", "answered", "closed"], "وضعیت معتبر نیست")
        .notRequired(),
});

module.exports = {
    createTicketValidator,
    updateTicketValidator,
};
