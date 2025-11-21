const { createDiscountCodeValidator, updateDiscountCodeValidator } = require('../../validator/discountCode');
const { errorResponse, successRespons } = require('../../helpers/responses');
const DiscountCode = require('../../model/DiscountCode');
const { createPaginationData } = require('../../utils');
const { isValidObjectId } = require('mongoose');

exports.createDiscountCode = async (req,res,next) => {
    try {
        const { code, percentage, expiresAt, usageLimit, isActive } = req.body;

        // Validate request body
        await createDiscountCodeValidator.validate(req.body, { abortEarly: false });

        // Check if code already exists
        const existingDiscountCode = await DiscountCode.findOne({ code: code.trim().toUpperCase() });
        if (existingDiscountCode) {
            return errorResponse(res, 409, 'Discount code already exists');
        }

        // Create discount code
        const newDiscountCode = await DiscountCode.create({
            code: code.trim().toUpperCase(),
            percentage,
            expiresAt: new Date(expiresAt),
            usageLimit: usageLimit || 1,
            isActive: isActive !== undefined ? isActive : true,
        });

        return successRespons(res, 201, {
            discountCode: newDiscountCode,
            message: 'Discount code created successfully'
        });

    } catch (err) {
        next(err);
    };
};

exports.getAllDiscountCode = async (req,res,next) => {
    try {
        const { page = 1, limit = 10, isActive, search } = req.query;

        // Build filters
        const filters = {};

        // Filter by isActive status
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true' || isActive === true;
        }

        // Search by code
        if (search) {
            filters.code = { $regex: search, $options: 'i' };
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find discount codes with filters, pagination
        const discountCodes = await DiscountCode.find(filters)
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        // Count total discount codes with filters
        const totalDiscountCodes = await DiscountCode.countDocuments(filters);

        return successRespons(res, 200, {
            discountCodes,
            pagination: createPaginationData(pageNum, limitNum, totalDiscountCodes, 'DiscountCodes'),
        });

    } catch (err) {
        next(err);
    };
};

exports.getOneDiscountCode = async (req,res,next) => {
    try {
        const { id } = req.params;

        // Validate discount code ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid discount code ID');
        }

        // Find discount code by ID
        const discountCode = await DiscountCode.findById(id);

        // Check if discount code exists
        if (!discountCode) {
            return errorResponse(res, 404, 'Discount code not found');
        }

        return successRespons(res, 200, {
            discountCode,
        });

    } catch (err) {
        next(err);
    };
};

exports.updateDiscountCode = async (req,res,next) => {
    try {
        const { id } = req.params;
        const { code, percentage, expiresAt, usageLimit, isActive } = req.body;

        // Validate discount code ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid discount code ID');
        }

        // Find discount code
        const existingDiscountCode = await DiscountCode.findById(id);
        if (!existingDiscountCode) {
            return errorResponse(res, 404, 'Discount code not found');
        }

        // Validate request body
        await updateDiscountCodeValidator.validate(req.body, { abortEarly: false });

        // Build update object (only update provided fields)
        const updateData = {};

    } catch (err) {
        next(err);
    };
};

exports.deleteDiscountCode = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.applyDiscountCode = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};