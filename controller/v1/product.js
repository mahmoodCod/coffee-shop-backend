const { createProductValidator } = require('../../validator/product');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Product = require('../../model/Product');
const Category = require('../../model/Category');
const { isValidObjectId } = require('mongoose');

const supportedFormat = [
    "image/jpeg",
    "image/svg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
];

exports.createProduct = async (req,res,next) => {
    try {
        const { 
            name, 
            slug, 
            description, 
            positiveFeature, 
            category, 
            badge, 
            status, 
            price, 
            stock, 
            originalPrice, 
            discount, 
            type, 
            dealType, 
            timeLeft, 
            soldCount, 
            totalCount, 
            rating, 
            reviews, 
            isPrime, 
            isPremium, 
            features, 
            image, 
            seo 
        } = req.body;

        // Validate request body
        await createProductValidator.validate(req.body, { abortEarly: false });

        // Check if slug already exists
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return errorResponse(res, 409, 'Product with this slug already exists');
        }

        // Validate category
        if (!isValidObjectId(category)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return errorResponse(res, 404, 'Category not found');
        }

    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError' && err.inner) {
            const validationErrors = err.inner.map(e => ({
                path: e.path,
                message: e.message
            }));
            return errorResponse(res, 400, 'Validation failed', validationErrors);
        }
        next(err);
    };
};

exports.getAllProduct = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.getOneProduct = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.updateProduct = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.deleteProduct = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

