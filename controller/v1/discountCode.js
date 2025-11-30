const { createDiscountCodeValidator, updateDiscountCodeValidator, applyDiscountCodeValidator } = require('../../validator/discountCode');
const { errorResponse, successRespons } = require('../../helpers/responses');
const DiscountCode = require('../../model/DiscountCode');
const { createPaginationData } = require('../../utils');
const { isValidObjectId } = require('mongoose');

exports.createDiscountCode = async (req,res,next) => {
    try {
        const { code, percentage, expiresAt, usageLimit, isActive } = req.body;

        await createDiscountCodeValidator.validate(req.body, { abortEarly: false });

        const existingDiscountCode = await DiscountCode.findOne({ code: code.trim().toUpperCase() });
        if (existingDiscountCode) {
            return errorResponse(res, 409, 'کد تخفیف قبلاً ثبت شده است');
        }

        const newDiscountCode = await DiscountCode.create({
            code: code.trim().toUpperCase(),
            percentage,
            expiresAt: new Date(expiresAt),
            usageLimit: usageLimit || 1,
            isActive: isActive !== undefined ? isActive : true,
        });

        return successRespons(res, 201, {
            discountCode: newDiscountCode,
            message: 'کد تخفیف با موفقیت ایجاد شد'
        });

    } catch (err) {
        next(err);
    };
};

exports.getAllDiscountCode = async (req,res,next) => {
    try {
        const { page = 1, limit = 10, isActive, search } = req.query;
        const filters = {};

        if (isActive !== undefined) filters.isActive = isActive === 'true' || isActive === true;
        if (search) filters.code = { $regex: search, $options: 'i' };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const discountCodes = await DiscountCode.find(filters)
            .sort({ createdAt: 'desc' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

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

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه کد تخفیف معتبر نیست');
        }

        const discountCode = await DiscountCode.findById(id);
        if (!discountCode) {
            return errorResponse(res, 404, 'کد تخفیف یافت نشد');
        }

        return successRespons(res, 200, { discountCode });

    } catch (err) {
        next(err);
    };
};

exports.updateDiscountCode = async (req,res,next) => {
    try {
        const { id } = req.params;
        const { code, percentage, expiresAt, usageLimit, isActive } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه کد تخفیف معتبر نیست');
        }

        const existingDiscountCode = await DiscountCode.findById(id);
        if (!existingDiscountCode) {
            return errorResponse(res, 404, 'کد تخفیف یافت نشد');
        }

        await updateDiscountCodeValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        if (code !== undefined && code.trim().toUpperCase() !== existingDiscountCode.code) {
            const duplicateDiscountCode = await DiscountCode.findOne({ code: code.trim().toUpperCase() });
            if (duplicateDiscountCode) {
                return errorResponse(res, 409, 'کد تخفیف قبلاً ثبت شده است');
            }
            updateData.code = code.trim().toUpperCase();
        }

        if (percentage !== undefined) updateData.percentage = percentage;
        if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
        if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedDiscountCode = await DiscountCode.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        return successRespons(res, 200, {
            discountCode: updatedDiscountCode,
            message: 'کد تخفیف با موفقیت بروزرسانی شد'
        });

    } catch (err) {
        next(err);
    };
};

exports.deleteDiscountCode = async (req,res,next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه کد تخفیف معتبر نیست');
        }

        const deletedDiscountCode = await DiscountCode.findByIdAndDelete(id);
        if (!deletedDiscountCode) {
            return errorResponse(res, 404, 'کد تخفیف یافت نشد');
        }

        return successRespons(res, 200, {
            message: 'کد تخفیف با موفقیت حذف شد',
            discountCode: deletedDiscountCode
        });

    } catch (err) {
        next(err);
    };
};

exports.applyDiscountCode = async (req,res,next) => {
    try {
        const { code } = req.body;

        await applyDiscountCodeValidator.validate(req.body, { abortEarly: false });

        const discountCode = await DiscountCode.findOne({ code: code.trim().toUpperCase() });
        if (!discountCode) {
            return errorResponse(res, 404, 'کد تخفیف یافت نشد');
        }

        if (!discountCode.isActive) {
            return errorResponse(res, 400, 'کد تخفیف فعال نیست');
        }

        if (new Date() > discountCode.expiresAt) {
            return errorResponse(res, 400, 'کد تخفیف منقضی شده است');
        }

        if (discountCode.usedCount >= discountCode.usageLimit) {
            return errorResponse(res, 400, 'حداکثر تعداد استفاده از این کد تخفیف رسیده است');
        }

        return successRespons(res, 200, {
            discountCode: {
                code: discountCode.code,
                percentage: discountCode.percentage,
                expiresAt: discountCode.expiresAt,
            },
            message: 'کد تخفیف معتبر است'
        });

    } catch (err) {
        next(err);
    };
};
