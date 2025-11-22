const { createValueBuyValidator } = require('../../validator/valueBuy');
const { errorResponse, successRespons } = require('../../helpers/responses');
const ValueBuy = require('../../model/ValueBuy');
const Product = require('../../model/Product');
const { isValidObjectId } = require('mongoose');

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