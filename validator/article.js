const yup = require('yup');

const createArticleValidator = yup.object().shape({
    title: yup
        .string()
        .required("عنوان مقاله الزامی است")
        .min(3, "عنوان باید حداقل 3 کاراکتر باشد")
        .max(150, "عنوان نمی تواند بیش از 150 کاراکتر باشد"),

    excerpt: yup
        .string()
        .required("گزیده مقاله الزامی است")
        .max(300, "گزیده نباید بیش از 300 کاراکتر باشد"),

    discription: yup
        .string()
        .required("توضیح کوتاه لازم است")
        .max(500, "شرح کوتاه نمی تواند بیش از 500 کاراکتر باشد"),
    
    body: yup
        .string()
        .required("بدن مقاله الزامی است"),

    cover: yup
        .string(),
        // .required("Cover image is required"),

    href: yup
        .string()
        .required("لینک مقاله الزامی است")
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "پیوند باید URL پسند باشد"),

    category: yup
        .string()
        .required("دسته بندی الزامی است"),

    creator: yup
        .string()
        .required("شناسه سازنده الزامی است"),

    badge: yup
        .string()
        .notRequired(),

    readTime: yup
        .string()
        .notRequired(),

    author: yup
        .string()
        .required("نام نویسنده الزامی است"),

    date: yup
        .date()
        .notRequired(),

    publish: yup
        .number()
        .required("وضعیت انتشار الزامی است"),
});

const updateArticleValidator = yup.object().shape({
    title: yup
        .string()
        .min(3, "عنوان باید حداقل 3 کاراکتر باشد")
        .max(150, "عنوان نمی تواند بیش از 150 کاراکتر باشد"),

    excerpt: yup
        .string()
        .max(300, "گزیده نباید بیش از 300 کاراکتر باشد"),

    discription: yup
        .string()
        .max(500, "شرح کوتاه نمی تواند بیش از 500 کاراکتر باشد"),

    body: yup
        .string(),

    cover: yup
        .string(),

    href: yup
        .string()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "پیوند باید URL پسند باشد"),

    category: yup
        .string(),

    creator: yup
        .string(),

    badge: yup
        .string(),

    readTime: yup
        .string(),

    author: yup
        .string(),

    date: yup
        .date(),

    publish: yup
        .number(),
});

module.exports = {
    createArticleValidator,
    updateArticleValidator
};