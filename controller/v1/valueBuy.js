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

        if (!isValidObjectId(product)) 
            return errorResponse(res, 400, 'شناسه محصول نامعتبر است');

        const productExists = await Product.findById(product);
        if (!productExists) 
            return errorResponse(res, 404, 'محصول یافت نشد');

        const existingValueBuy = await ValueBuy.findOne({ product });
        if (existingValueBuy) 
            return errorResponse(res, 409, 'این محصول قبلاً در ValueBuy ثبت شده است');

        // ---- تبدیل ورودی features به آرایه رشته ----
        const allowedFeatures = ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"];
        let finalFeatures = [];

        if (Array.isArray(features)) {
            finalFeatures = features.filter(f => allowedFeatures.includes(f));
        }

        if (finalFeatures.length === 0) {
            finalFeatures = ["پیشنهاد شده"]; // مقدار پیش‌فرض مدل
        }

        // ---- تبدیل ورودی filters به آرایه رشته ----
        const allowedFilters = ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"];
        let finalFilters = [];

        if (Array.isArray(filters)) {
            finalFilters = filters.filter(f => allowedFilters.includes(f));
        }

        if (finalFilters.length === 0) {
            finalFilters = ["انتخاب اقتصادی"];
        }

        const newValueBuy = await ValueBuy.create({
            product,
            features: finalFeatures,
            filters: finalFilters,
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
        const { page = 1, limit = 10, product, isActive, feature, filter } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const filtersQuery = {};

        if (isActive !== undefined)
            filtersQuery.isActive = isActive === 'true';

        if (product && isValidObjectId(product))
            filtersQuery.product = product;

        // ------ فیلترگذاری براساس ویژگی‌ها ------
        const allowedFeatures = ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"];
        if (feature && allowedFeatures.includes(feature)) {
            filtersQuery.features = feature; // جستجو داخل آرایه
        }

        // ------ فیلترگذاری براساس فیلترها ------
        const allowedFilters = ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"];
        if (filter && allowedFilters.includes(filter)) {
            filtersQuery.filters = filter; // جستجو داخل آرایه
        }

        const valueBuys = await ValueBuy.find(filtersQuery)
            .populate('product', 'name slug price image stock brand category')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .select('-__v');

        const total = await ValueBuy.countDocuments(filtersQuery);

        return successRespons(res, 200, {
            valueBuys,
            pagination: createPaginationData(pageNum, limitNum, total, 'ValueBuys'),
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
        const { product, features, filters, isActive } = req.body;

        if (!isValidObjectId(id))
            return errorResponse(res, 400, 'شناسه ValueBuy نامعتبر است');

        const existingValueBuy = await ValueBuy.findById(id);
        if (!existingValueBuy)
            return errorResponse(res, 404, 'ValueBuy یافت نشد');

        await updateValueBuyValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        // --- تغییر محصول ---
        if (product !== undefined) {
            if (!isValidObjectId(product))
                return errorResponse(res, 400, 'شناسه محصول نامعتبر است');

            const productExists = await Product.findById(product);
            if (!productExists)
                return errorResponse(res, 404, 'محصول یافت نشد');

            if (product !== existingValueBuy.product.toString()) {
                const duplicate = await ValueBuy.findOne({ product });
                if (duplicate)
                    return errorResponse(res, 409, 'این محصول قبلاً در ValueBuy دیگری ثبت شده');
            }

            updateData.product = product;
        }

        // --- اصلاح features ---
        if (features !== undefined) {
            const allowedFeatures = ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"];

            if (!Array.isArray(features))
                return errorResponse(res, 400, "features باید آرایه باشد");

            const filtered = features.filter(f => allowedFeatures.includes(f));

            if (filtered.length === 0)
                return errorResponse(res, 400, "هیچ مقدار معتبر برای features ارسال نشده");

            updateData.features = filtered;
        }

        // --- اصلاح filters ---
        if (filters !== undefined) {
            const allowedFilters = ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"];

            if (!Array.isArray(filters))
                return errorResponse(res, 400, "filters باید آرایه باشد");

            const filtered = filters.filter(f => allowedFilters.includes(f));

            if (filtered.length === 0)
                return errorResponse(res, 400, "هیچ مقدار معتبر برای filters ارسال نشده");

            updateData.filters = filtered;
        }

        // --- اصلاح isActive ---
        if (isActive !== undefined) updateData.isActive = isActive;

        const updated = await ValueBuy.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('product', 'name slug price image')
            .select('-__v');

        return successRespons(res, 200, {
            valueBuy: updated,
            message: "ValueBuy با موفقیت بروزرسانی شد"
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
