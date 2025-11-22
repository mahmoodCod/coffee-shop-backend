const yup = require('yup');
const { isValidObjectId } = require('mongoose');

const createValueBuyValidator  = yup.object().shape({
    product: yup
        .string()
        .required("Product ID is required")
        .test("is-objectid", "Invalid Product ID", (value) =>
            isValidObjectId(value)
        ),

    features: yup
        .object({
          recommended: yup.boolean(),
          specialDiscount: yup.boolean(),
          lowStock: yup.boolean(),
          rareDeal: yup.boolean(),
        })
        .noUnknown(true, "Unknown feature key")
        .required("Features object is required"),
    
    filters: yup
        .object({
          economicChoice: yup.boolean(),
          bestValue: yup.boolean(),
          topSelling: yup.boolean(),
          freeShipping: yup.boolean(),
        })
        .noUnknown(true, "Unknown feature key")
        .required("Filters object is required"),

    isActive: yup.boolean(),
});

const updateValueBuyValidator = yup.object().shape({
    product: yup
        .string()
        .notRequired()
        .test("is-objectid", "Invalid Product ID", (value) => {
            if (!value) return true;
            return isValidObjectId(value);
        }),

    features: yup.object({
        recommended: yup.boolean(),
        specialDiscount: yup.boolean(),
        lowStock: yup.boolean(),
        rareDeal: yup.boolean(),
        }),

    filters: yup.object({
        economicChoice: yup.boolean(),
        bestValue: yup.boolean(),
        topSelling: yup.boolean(),
        freeShipping: yup.boolean(),
        }),

    isActive: yup.boolean(),
});

module.exports = {
    createValueBuyValidator,
    updateValueBuyValidator
};