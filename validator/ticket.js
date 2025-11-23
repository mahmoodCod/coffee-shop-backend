const yup = require("yup");
const { isValidObjectId } = require("mongoose");

// Validate MongoDB ObjectId
const objectIdValidation = (value) =>
    !value || isValidObjectId(value);

const createTicketValidator = yup.object().shape({
    departmentId: yup
        .string()
        .required("departmentId is required")
        .test("is-objectid", "Invalid departmentId", objectIdValidation),

    departmentSubId: yup
        .string()
        .required("departmentSubId is required")
        .test("is-objectid", "Invalid departmentSubId", objectIdValidation),

    priority: yup
        .string()
        .oneOf(["low", "medium", "high"], "Invalid priority value")
        .required("priority is required"),

    title: yup
        .string()
        .required("title is required")
        .min(3, "title must be at least 3 characters"),

    body: yup
        .string()
        .required("body is required")
        .min(5, "body must be at least 5 characters"),

    user: yup
        .string()
        .required("user is required")
        .test("is-objectid", "Invalid user ID", objectIdValidation),

    product: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "Invalid product ID", objectIdValidation),

    parent: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "Invalid parent ID", objectIdValidation),

    isAnswered: yup
        .boolean()
        .notRequired(),

    status: yup
        .string()
        .oneOf(["open", "answered", "closed"], "Invalid status value")
        .notRequired(),
});

const updateTicketValidator = yup.object().shape({
    departmentId: yup
        .string()
        .notRequired()
        .test("is-objectid", "Invalid departmentId", objectIdValidation),

    departmentSubId: yup
        .string()
        .notRequired()
        .test("is-objectid", "Invalid departmentSubId", objectIdValidation),

    priority: yup
        .string()
        .oneOf(["low", "medium", "high"], "Invalid priority value")
        .notRequired(),

    title: yup
        .string()
        .min(3, "title must be at least 3 characters")
        .notRequired(),

    body: yup
        .string()
        .min(5, "body must be at least 5 characters")
        .notRequired(),

    product: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "Invalid product ID", objectIdValidation),

    parent: yup
        .string()
        .nullable()
        .notRequired()
        .test("is-objectid", "Invalid parent ID", objectIdValidation),

    isAnswered: yup
        .boolean()
        .notRequired(),

    status: yup
        .string()
        .oneOf(["open", "answered", "closed"], "Invalid status value")
        .notRequired(),
});

module.exports = {
    createTicketValidator,
    updateTicketValidator,
};