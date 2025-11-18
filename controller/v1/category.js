const { categorySchema, categoryUpdateSchema } = require('../../validator/category');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Category = require('../../model/Category');
const { isValidObjectId } = require('mongoose');
const { createPaginationData } = require('../../utils');

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
        let { page = 1, limit = 10, isActive, parent } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Build query
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (parent !== undefined) {
            if (parent === 'null' || parent === null) {
                query.parent = null;
            } else if (isValidObjectId(parent)) {
                query.parent = parent;
            }
        }

        const categories = await Category.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        const totalCategories = await Category.countDocuments(query);

        return successRespons(res, 200, {
            categories,
            pagination: createPaginationData(page, limit, totalCategories, 'Categories'),
        });

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
        const categoryTree = await Category.getCategoryTree();

        return successRespons(res, 200, {
            categories: categoryTree,
            message: 'Category tree retrieved successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getFeaturedCategories = async(req,res,next) => {
    try{
        const featuredCategories = await Category.find({
            showOnHomepage: true,
            isActive: true
        })
        .sort({ order: 1 })
        .select('-__v');

        return successRespons(res, 200, {
            categories: featuredCategories,
            message: 'Featured categories retrieved successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getRootCategories = async(req,res,next) => {
    try{
        const rootCategories = await Category.getRootCategories();

        return successRespons(res, 200, {
            categories: rootCategories,
            message: 'Root categories retrieved successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.updateCategory = async(req,res,next) => {
    try{
        const { categoryId } = req.params;
        const { name, slug, description, parent, images, color, order, isActive, showOnHomepage, seo } = req.body;

        // Validate categoryId
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }

        // Find category
        const category = await Category.findById(categoryId);
        if (!category) {
            return errorResponse(res, 404, 'Category not found');
        }

        // Validate request body
        await categoryUpdateSchema.validate(req.body, { abortEarly: false });

        // Check slug uniqueness if slug is being updated
        if (slug && slug !== category.slug) {
            const existingCategory = await Category.findOne({ slug, _id: { $ne: categoryId } });
            if (existingCategory) {
                return errorResponse(res, 409, 'Category with this slug already exists');
            }
        };

        // Validate parent if provided
        if (parent !== undefined && parent !== null) {
            if (!isValidObjectId(parent)) {
                return errorResponse(res, 400, 'Invalid parent category ID');
            }
            if (parent === categoryId) {
                return errorResponse(res, 400, 'Category cannot be its own parent');
            }
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return errorResponse(res, 404, 'Parent category not found');
            }
        }

        // Handle image upload if file exists
        let imagePath = images;
        if (req.file) {
            // Validate file format
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
            }
            imagePath = req.file.path.replace(/\\/g, '/');
        };

        // Build update object (only update provided fields)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (slug !== undefined) updateData.slug = slug;
        if (description !== undefined) updateData.description = description;
        if (imagePath !== undefined && imagePath !== null) updateData.images = imagePath;
        if (color !== undefined) updateData.color = color;
        if (parent !== undefined) updateData.parent = parent || null;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (showOnHomepage !== undefined) updateData.showOnHomepage = showOnHomepage;
        if (seo !== undefined) updateData.seo = seo;

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );

        return successRespons(res, 200, {
            category: updatedCategory,
            message: 'Category updated successfully'
        });
    } catch (err) {
        next(err);
    };
};

exports.removeCategory = async(req,res,next) => {
    try{
        const { categoryId } = req.params;

        // Validate categoryId
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }

        // Find category
        const category = await Category.findById(categoryId);
        if (!category) {
            return errorResponse(res, 404, 'Category not found');
        }

        // Check if category has subcategories
        const subcategoriesCount = await Category.countDocuments({ parent: categoryId });
        if (subcategoriesCount > 0) {
            return errorResponse(res, 400, 'Cannot delete category with subcategories. Please delete subcategories first');
        }

        // Delete category
        await Category.findByIdAndDelete(categoryId);

        return successRespons(res, 200, {
            message: 'Category deleted successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getSubcategories = async(req,res,next) => {
    try{
        const { categoryId } = req.params;

        // Validate categoryId
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }

        // Find category
        const category = await Category.findById(categoryId);
        if (!category) {
            return errorResponse(res, 404, 'Category not found');
        }

        // Get subcategories
        const subcategories = await Category.find({
            parent: categoryId,
            isActive: true
        })
        .sort({ order: 1 })
        .select('-__v');

        return successRespons(res, 200, {
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug
            },
            subcategories,
            message: 'Subcategories retrieved successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.updateCategoryStatus = async(req,res,next) => {
    try{
        const { categoryId } = req.params;
        const { isActive } = req.body;

        // Validate categoryId
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }

        // Validate isActive
        if (typeof isActive !== 'boolean') {
            return errorResponse(res, 400, 'isActive must be a boolean value');
        }

        // Find and update category
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { isActive },
            { new: true, runValidators: true }
        );

        if (!category) {
            return errorResponse(res, 404, 'Category not found');
        }

        return successRespons(res, 200, {
            category,
            message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (err) {
        next(err);
    };
};

exports.updateCategoryOrder = async(req,res,next) => {
    try{
        const { categoryId } = req.params;
        const { order } = req.body;

        // Validate categoryId
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }

        // Validate order
        if (order === undefined || order === null) {
            return errorResponse(res, 400, 'Order is required');
        }
        if (typeof order !== 'number' || order < 0) {
            return errorResponse(res, 400, 'Order must be a positive number');
        }

        // Find and update category
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { order },
            { new: true, runValidators: true }
        );

        if (!category) {
            return errorResponse(res, 404, 'Category not found');
        }

        return successRespons(res, 200, {
            category,
            message: 'Category order updated successfully'
        });

    } catch (err) {
        next(err);
    };
};