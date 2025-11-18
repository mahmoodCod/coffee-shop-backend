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

        if (req.body.features && typeof req.body.features === 'string') {
            req.body.features = req.body.features
              .replace(/["']/g, '')
              .split(',')
              .map(f => f.trim())
              .filter(f => f);
        }

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

        // Handle image uploads
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Validate file format
                if (!supportedFormat.includes(file.mimetype)) {
                    return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
                }
                imagePaths.push(file.path.replace(/\\/g, '/'));
            }
        }

        // Set main image (first uploaded image or default)
        const mainImage = imagePaths.length > 0 ? imagePaths[0] : (image || '/images/default-product.jpg');

        // Create product object
        const productData = {
            name,
            slug,
            description: description || '',
            positiveFeature,
            category,
            badge,
            status: status || 'inactive',
            price,
            stock,
            originalPrice: originalPrice || 0,
            discount: discount || 0,
            type: type || 'regular',
            dealType: dealType || '',
            timeLeft: timeLeft || '',
            soldCount: soldCount || 0,
            totalCount: totalCount || 0,
            rating: rating || 0,
            reviews: reviews || 0,
            isPrime: isPrime || false,
            isPremium: isPremium || false,
            features: features || [],
            image: mainImage,
            images: imagePaths,
        };

        // Add SEO data if provided
        if (seo) {
            productData.seo = seo;
        }

        // Create product
        const newProduct = await Product.create(productData);

        return successRespons(res, 201, {
            product: newProduct,
            message: 'Product created successfully'
        });

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

