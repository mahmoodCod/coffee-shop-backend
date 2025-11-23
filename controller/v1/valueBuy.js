const { createValueBuyValidator, updateValueBuyValidator } = require('../../validator/valueBuy');
const { errorResponse, successRespons } = require('../../helpers/responses');
const ValueBuy = require('../../model/ValueBuy');
const Product = require('../../model/Product');
const { isValidObjectId } = require('mongoose');
const { createPaginationData } = require('../../utils');

exports.createValueBuy = async (req,res,next) => {
    try {
        const { product, features, filters, isActive } = req.body;

        // Validate request body
        await createValueBuyValidator.validate(req.body, { abortEarly: false });

        // Validate product ID
        if (!isValidObjectId(product)) {
            return errorResponse(res, 400, 'شناسه محصول نامعتبر است');
        }

        // Check if product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
            return errorResponse(res, 404, 'محصول یافت نشد');
        }

        // Check if this product already exists in ValueBuy
        const existingValueBuy = await ValueBuy.findOne({ product });
        if (existingValueBuy) {
            return errorResponse(res, 409, 'این محصول قبلاً در ValueBuy ثبت شده است');
        }

        // Allowed features and filters (Persian)
        const allowedFeatures = ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"];
        const allowedFilters = ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"];

        // Filter only allowed features
        let filteredFeatures = Array.isArray(features)
            ? features.filter(f => allowedFeatures.includes(f))
            : [];

        // Ensure at least one feature exists
        if (filteredFeatures.length === 0) {
            filteredFeatures.push("پیشنهاد شده");
        }

        // Filter only allowed filters
        const filteredFilters = Array.isArray(filters)
            ? filters.filter(f => allowedFilters.includes(f))
            : [];

        // Create ValueBuy
        const newValueBuy = await ValueBuy.create({
            product,
            features: filteredFeatures,
            filters: filteredFilters.length > 0 ? filteredFilters : ["انتخاب اقتصادی"],
            isActive: isActive !== undefined ? isActive : true,
        });

        // Populate product details
        await newValueBuy.populate('product', 'name slug price image');

        return successRespons(res, 201, {
            valueBuy: newValueBuy,
            message: 'ValueBuy با موفقیت ایجاد شد'
        });

    } catch (err) {
        next(err);
    }
};

exports.getAllValueBuy = async (req,res,next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            isActive,
            features,
            filters,
            product
        } = req.query;

        // Build filters
        const queryFilters = {};

        if (isActive !== undefined) {
            queryFilters.isActive = isActive === 'true' || isActive === true;
        }

        if (product !== undefined && isValidObjectId(product)) {
            queryFilters.product = product;
        }

        // Filter by features (comma-separated list)
        if (features) {
            const featureArray = features.split(',');
            queryFilters.features = { $all: featureArray };
        }

        // Filter by filters (comma-separated list)
        if (filters) {
            const filterArray = filters.split(',');
            queryFilters.filters = { $all: filterArray };
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Query ValueBuy collection
        const valueBuys = await ValueBuy.find(queryFilters)
            .populate('product', 'name slug price image stock brand category')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

        const totalValueBuys = await ValueBuy.countDocuments(queryFilters);

        return successRespons(res, 200, {
            valueBuys,
            pagination: createPaginationData(pageNum, limitNum, totalValueBuys, 'ValueBuys')
        });

    } catch (err) {
        next(err);
    }
};

exports.getOneValueBuy = async (req,res,next) => {
    try {
        const { id } = req.params;

        // Validate ValueBuy ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid ValueBuy ID');
        }

        // Find ValueBuy by ID and populate product
        const valueBuy = await ValueBuy.findById(id)
            .populate('product', 'name slug price image stock brand category description')
            .select('-__v');

        // Check if ValueBuy exists
        if (!valueBuy) {
            return errorResponse(res, 404, 'ValueBuy not found');
        }

        return successRespons(res, 200, {
            valueBuy,
        });

    } catch (err) {
        next(err);
    };
};

exports.updateValueBuy = async (req,res,next) => {
    try {
        const { id } = req.params;
        const { product, features,isActive } = req.body;

        // Validate ValueBuy ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid ValueBuy ID');
        }

        // Find ValueBuy
        const existingValueBuy = await ValueBuy.findById(id);
        if (!existingValueBuy) {
            return errorResponse(res, 404, 'ValueBuy not found');
        }

        // Validate request body
        await updateValueBuyValidator.validate(req.body, { abortEarly: false });

        // Build update object (only update provided fields)
        const updateData = {};

        // Check if product is being updated
        if (product !== undefined) {
            // Validate product ID
            if (!isValidObjectId(product)) {
                return errorResponse(res, 400, 'Invalid product ID');
            }

            // Check if product exists
            const productExists = await Product.findById(product);
            if (!productExists) {
                return errorResponse(res, 404, 'Product not found');
            }

            // Check if this product already exists in another ValueBuy
            if (product !== existingValueBuy.product.toString()) {
                const duplicateValueBuy = await ValueBuy.findOne({ product });
                if (duplicateValueBuy) {
                    return errorResponse(res, 409, 'This product already exists in another ValueBuy');
                }
            }
            updateData.product = product;
        }

        // Update features if provided
        if (features !== undefined) {
            updateData.features = {
                ...existingValueBuy.features,
                ...features
            };
        }

        // Update isActive if provided
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        // Update ValueBuy
        const updatedValueBuy = await ValueBuy.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('product', 'name slug price image stock brand category description')
        .select('-__v');

        return successRespons(res, 200, {
            valueBuy: updatedValueBuy,
            message: 'ValueBuy updated successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.deleteValueBuy = async (req,res,next) => {
    try {
        const { id } = req.params;

        // Validate ValueBuy ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid ValueBuy ID');
        }

        // Find and delete ValueBuy
        const deletedValueBuy = await ValueBuy.findByIdAndDelete(id);

        // Check if ValueBuy exists
        if (!deletedValueBuy) {
            return errorResponse(res, 404, 'ValueBuy not found');
        }

        return successRespons(res, 200, {
            message: 'ValueBuy deleted successfully',
            valueBuy: deletedValueBuy
        });

    } catch (err) {
        next(err);
    };
};