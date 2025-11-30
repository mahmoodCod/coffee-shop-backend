const { createValueBuyValidator, updateValueBuyValidator } = require('../../validator/valueBuy');
const { errorResponse, successRespons } = require('../../helpers/responses');
const ValueBuy = require('../../model/ValueBuy');
const Product = require('../../model/Product');
const { isValidObjectId } = require('mongoose');
const { createPaginationData } = require('../../utils');

exports.createValueBuy = async (req, res, next) => {
    try {
        const { product, features, filters, isActive } = req.body;

        await createValueBuyValidator.validate(req.body, { abortEarly: false });

        if (!isValidObjectId(product)) return errorResponse(res, 400, 'شناسه محصول نامعتبر است');

        const productExists = await Product.findById(product);
        if (!productExists) return errorResponse(res, 404, 'محصول یافت نشد');

        const existingValueBuy = await ValueBuy.findOne({ product });
        if (existingValueBuy) return errorResponse(res, 409, 'این محصول قبلاً در ValueBuy ثبت شده است');

        const allowedFeatures = ['recommended', 'specialDiscount', 'lowStock', 'rareDeal'];
        const allowedFilters = ['economicChoice', 'bestValue', 'topSelling', 'freeShipping'];

        const filteredFeatures = {};
        allowedFeatures.forEach(key => {
            if (features && features[key] !== undefined) filteredFeatures[key] = features[key];
        });

        const filteredFilters = {};
        allowedFilters.forEach(key => {
            filteredFilters[key] = filters && filters[key] !== undefined ? filters[key] : false;
        });

        const newValueBuy = await ValueBuy.create({
            product,
            features: filteredFeatures,
            filters: filteredFilters,
            isActive: isActive !== undefined ? isActive : true,
        });

        await newValueBuy.populate('product', 'name slug price image');

        return successRespons(res, 201, {
            valueBuy: newValueBuy,
            message: 'مقدار خرید با موفقیت ایجاد شد',
        });

    } catch (err) {
        next(err);
    }
};

exports.getAllValueBuy = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, product, isActive } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const filters = {};

        if (isActive !== undefined) filters.isActive = isActive === 'true' || isActive === true;
        if (product && isValidObjectId(product)) filters.product = product;

        const allowedFeatures = ['recommended', 'specialDiscount', 'lowStock', 'rareDeal'];
        const allowedFilters = ['economicChoice', 'bestValue', 'topSelling', 'freeShipping'];

        allowedFeatures.forEach(key => {
            if (req.query[key] !== undefined) filters[`features.${key}`] = req.query[key] === 'true';
        });

        allowedFilters.forEach(key => {
            if (req.query[key] !== undefined) filters[`filters.${key}`] = req.query[key] === 'true';
        });

        const valueBuys = await ValueBuy.find(filters)
            .populate('product', 'name slug price image stock brand category')
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

        const totalValueBuys = await ValueBuy.countDocuments(filters);

        return successRespons(res, 200, {
            valueBuys,
            pagination: createPaginationData(pageNum, limitNum, totalValueBuys, 'ValueBuys'),
        });

    } catch (err) {
        next(err);
    }
};

exports.getOneValueBuy = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه ValueBuy نامعتبر است');

        const valueBuy = await ValueBuy.findById(id)
            .populate('product', 'name slug price image stock brand category description')
            .select('-__v');

        if (!valueBuy) return errorResponse(res, 404, 'ValueBuy یافت نشد');

        return successRespons(res, 200, { valueBuy });

    } catch (err) {
        next(err);
    }
};

exports.updateValueBuy = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { product, features, isActive } = req.body;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه ValueBuy نامعتبر است');

        const existingValueBuy = await ValueBuy.findById(id);
        if (!existingValueBuy) return errorResponse(res, 404, 'ValueBuy یافت نشد');

        await updateValueBuyValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        if (product !== undefined) {
            if (!isValidObjectId(product)) return errorResponse(res, 400, 'شناسه محصول نامعتبر است');

            const productExists = await Product.findById(product);
            if (!productExists) return errorResponse(res, 404, 'محصول یافت نشد');

            if (product !== existingValueBuy.product.toString()) {
                const duplicate = await ValueBuy.findOne({ product });
                if (duplicate) return errorResponse(res, 409, 'این محصول قبلاً در یک ValueBuy دیگر ثبت شده است');
            }

            updateData.product = product;
        }

        if (features !== undefined) updateData.features = { ...existingValueBuy.features, ...features };
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedValueBuy = await ValueBuy.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('product', 'name slug price image stock brand category description')
            .select('-__v');

        return successRespons(res, 200, {
            valueBuy: updatedValueBuy,
            message: 'ValueBuy با موفقیت بروزرسانی شد',
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteValueBuy = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه ValueBuy نامعتبر است');

        const deletedValueBuy = await ValueBuy.findByIdAndDelete(id);
        if (!deletedValueBuy) return errorResponse(res, 404, 'ValueBuy یافت نشد');

        return successRespons(res, 200, {
            valueBuy: deletedValueBuy,
            message: 'ValueBuy با موفقیت حذف شد',
        });

    } catch (err) {
        next(err);
    }
};
