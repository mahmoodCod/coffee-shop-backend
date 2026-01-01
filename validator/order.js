const yup = require("yup");
const { isValidObjectId } = require("mongoose");

const createOrderValidator = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        product: yup
          .string()
          .required("شناسه محصول الزامی است")
          .test("is-valid-object-id", "شناسه محصول نامعتبر است", (value) =>
            isValidObjectId(value)
          ),
        quantity: yup
          .number()
          .required("مقدار مورد نیاز است")
          .min(1, "مقدار باید حداقل 1 باشد"),
      })
    )
    .min(1, "حداقل یک مورد مورد نیاز است")
    .required("موارد مورد نیاز است"),
  shippingAddress: yup.object({
    postalCode: yup.string().required("کد پستی الزامی است"),
    coordinates: yup.object({
      lat: yup.string().required("عرض جغرافیایی لازم است"),
      lng: yup.string().required("طول جغرافیایی مورد نیاز است"),
    }),
    address: yup.string().required("آدرس الزامی است"),
    cityId: yup.number().required("شناسه شهر الزامی است"),
  }),
  authority: yup.string().required("اختیار لازم است"),
});

const updateOrderValidator = yup.object({
  status: yup
    .string()
    .required("وضعیت مورد نیاز است")
    .oneOf(["PROCESSING", "SHIPPED", "DELIVERED"]),
  postTrackingCode: yup.string(),
});

module.exports = {
  createOrderValidator,
  updateOrderValidator,
};
