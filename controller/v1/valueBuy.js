const { createValueBuyValidator } = require('../../validator/valueBuy');
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
            return errorResponse(res, 400, 'Invalid product ID');
        }

        // Check if product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
            return errorResponse(res, 404, 'Product not found');
        }

        // Check if this product already exists in ValueBuy
        const existingValueBuy = await ValueBuy.findOne({ product });
        if (existingValueBuy) {
            return errorResponse(res, 409, 'This product already exists in ValueBuy');
        }

        // Create ValueBuy
        const newValueBuy = await ValueBuy.create({
            product,
            features: features || {},
            filters: filters || {},
            isActive: isActive !== undefined ? isActive : true,
        });

        // Populate product details
        await newValueBuy.populate('product', 'name slug price image');

        return successRespons(res, 201, {
            valueBuy: newValueBuy,
            message: 'ValueBuy created successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getAllValueBuy = async (req,res,next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            isActive,
            recommended,
            specialDiscount,
            lowStock,
            rareDeal,
            economicChoice,
            bestValue,
            topSelling,
            freeShipping,
            product
        } = req.query;

        // Build filters
        const filters = {};

        // Filter by isActive status
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true' || isActive === true;
        }

        // Filter by product ID
        if (product !== undefined) {
            if (isValidObjectId(product)) {
                filters.product = product;
            }
        }

        // Filter by features
        if (recommended !== undefined) {
            filters['features.recommended'] = recommended === 'true' || recommended === true;
        }
        if (specialDiscount !== undefined) {
            filters['features.specialDiscount'] = specialDiscount === 'true' || specialDiscount === true;
        }
        if (lowStock !== undefined) {
            filters['features.lowStock'] = lowStock === 'true' || lowStock === true;
        }
        if (rareDeal !== undefined) {
            filters['features.rareDeal'] = rareDeal === 'true' || rareDeal === true;
        }

        // Filter by filters
        if (economicChoice !== undefined) {
            filters['filters.economicChoice'] = economicChoice === 'true' || economicChoice === true;
        }
        if (bestValue !== undefined) {
            filters['filters.bestValue'] = bestValue === 'true' || bestValue === true;
        }
        if (topSelling !== undefined) {
            filters['filters.topSelling'] = topSelling === 'true' || topSelling === true;
        }
        if (freeShipping !== undefined) {
            filters['filters.freeShipping'] = freeShipping === 'true' || freeShipping === true;
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find ValueBuy items with filters, pagination, and populate product
        const valueBuys = await ValueBuy.find(filters)
            .populate('product', 'name slug price image stock brand category')
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

        // Count total ValueBuy items with filters
        const totalValueBuys = await ValueBuy.countDocuments(filters);

        return successRespons(res, 200, {
            valueBuys,
            pagination: createPaginationData(pageNum, limitNum, totalValueBuys, 'ValueBuys'),
        });

    } catch (err) {
        next(err);
    };
};

exports.getOneValueBuy = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.updateValueBuy = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.deleteValueBuy = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};