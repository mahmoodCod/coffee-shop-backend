const { createDiscountCodeValidator } = require('../../validator/discountCode');
const { errorResponse, successRespons } = require('../../helpers/responses');
const DiscountCode = require('../../model/DiscountCode');

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

    } catch (err) {
        next(err);
    };
};

exports.getOneDiscountCode = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.updateDiscountCode = async (req,res,next) => {
    try {

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