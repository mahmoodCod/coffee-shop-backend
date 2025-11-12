const yup = require('yup');

const sendOtpValidator = yup.object({
    phone: yup
    .string()
    .required('Phone is required')
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'phone number is not valid')
});