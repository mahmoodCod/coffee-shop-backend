const yup = require('yup');

const createAddressValidator = yup.object({
  name: yup
  .string()
  .required("Name is required")
  .min(3)
  .max(255),

  postalCode: yup
  .string()
  .required("Postal code is required")
  .length(10),

  province: yup
  .string()
  .required("Province is required")
  .min(3, "Province must have at least 2 letters")
  .max(50, "Province must have at most 50 letters"),

  city: yup
  .string()
  .required("City is required")
  .min(2, "City must have at least 2 letters")
  .max(50, "City must have at ,most 50 letters"),

  street: yup
  .string
  .required("Street is required")
  .min(3, "Street name is too short")
  .max(255, "Street name is too long"),
});