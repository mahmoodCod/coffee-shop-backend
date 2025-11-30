const yup = require('yup');

const createAddressValidator = yup.object({
  name: yup
  .string()
  .required("نام الزامی است")
  .min(3)
  .max(255),

  postalCode: yup
  .string()
  .required("کد پستی الزامی است")
  .length(10),

  province: yup
  .string()
  .required("استان مورد نیاز است")
  .min(3, "استان باید حداقل 2 حرف داشته باشد")
  .max(50, "استان باید حداکثر 50 حرف داشته باشد"),

  city: yup
  .string()
  .required("شهر مورد نیاز است")
  .min(2, "شهر باید حداقل 2 حرف داشته باشد")
  .max(50, "شهر باید حداکثر 50 حرف داشته باشد"),

  street: yup
  .string()
  .required("خیابان الزامی است")
  .min(3, "نام خیابان خیلی کوتاه است")
  .max(255, "نام خیابان خیلی طولانی است"),
});

const updateAddressValidator = yup.object({
  name: yup
  .string()
  .min(3)
  .max(255),

  postalCode: yup
  .string()
  .length(10),

  province: yup
  .string()
  .min(3)
  .max(50),

  city: yup
  .string()
  .min(2)
  .max(50),

  street: yup
  .string()
  .min(3)
  .max(255),
});

module.exports = {
    createAddressValidator,
    updateAddressValidator,
};