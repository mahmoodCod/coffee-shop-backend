const { categorySchema } = require('../../validator/category');
const { errorResponse, successRespons } = require('../../helpers/responses');
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

exports.getCategory = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.createCategory = async(req,res,next) => {
    try{
        const { name, slug, description, parent, images, color, order, isActive, showOnHomepage, seo } = req.body;

        // Validate request body
        await categorySchema.validate(req.body, { abortEarly: false });

        // Check if slug already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return errorResponse(res, 409, 'Category with this slug already exists');
        }

        // Validate parent if provided
        if (parent) {
            if (!isValidObjectId(parent)) {
                return errorResponse(res, 400, 'Invalid parent category ID');
            }
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return errorResponse(res, 404, 'Parent category not found');
            }
        }

        // Handle image upload if file exists
        let imagePath = images || '/images/categories/default.jpg';
        if (req.file) {
            // Validate file format
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
            }
            imagePath = req.file.path.replace(/\\/g, '/');
        }

        // Create category object
        const categoryData = {
            name,
            slug,
            description: description || '',
            images: imagePath,
            color: color || '#8B4513',
            parent: parent || null,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true,
            showOnHomepage: showOnHomepage || false,
        };

        // Add SEO data if provided
        if (seo) {
            categoryData.seo = seo;
        }

        // Create category
        const newCategory = await Category.create(categoryData);

        return successRespons(res, 201, {
            category: newCategory,
            message: 'Category created successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getCategoryTree = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.getFeaturedCategories = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.getRootCategories = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.updateCategory = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.removeCategory = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.getSubcategories = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.updateCategoryStatus = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};

exports.updateCategoryOrder = async(req,res,next) => {
    try{

    } catch (err) {
        next(err);
    };
};