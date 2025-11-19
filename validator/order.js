const yup = require("yup");
const { isValidObjectId } = require("mongoose");

const createOrderValidator = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        product: yup
          .string()
          .required("Product ID is required")
          .test("is-valid-object-id", "Invalid product ID", (value) =>
            isValidObjectId(value)
          ),
        quantity: yup
          .number()
          .required("Quantity is required")
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required")
    .required("Items are required"),
  shippingAddress: yup.object({
    postalCode: yup.string().required("Postal code is required"),
    coordinates: yup.object({
      lat: yup.string().required("Latitude is required"),
      lng: yup.string().required("Longitude is required"),
    }),
    address: yup.string().required("Address is required"),
    cityId: yup.number().required("City ID is required"),
  }),
  authority: yup.string().required("Authority is required"),
});

const updateOrderValidator = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["PROCESSING", "SHIPPED", "DELIVERED"]),
  postTrackingCode: yup.string(),
});

module.exports = {
  createOrderValidator,
  updateOrderValidator,
};
