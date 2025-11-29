const { createAddressValidator, updateAddressValidator } = require('../../validator/address');
const cities = require('../../cities/cities.json');
const { errorResponse, successRespons } = require('../../helpers/responses');
const User = require('../../model/User');
const Ban = require('../../model/Ban');
const { createPaginationData } = require('../../utils');
const { isValidObjectId } = require('mongoose');

exports.getAll = async (req, res, next) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const users = await User.find({})
            .skip((page - 1) * limit)
            .limit(limit);

        const totalUsers = await User.countDocuments();

        return successRespons(res, 200, {
            users,
            pagination: createPaginationData(page, limit, totalUsers, 'کاربران'),
        });

    } catch (err) {
        next(err);
    }
};

exports.banUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return errorResponse(res, 404, 'کاربر یافت نشد');

        if (user.roles.includes("ADMIN")) {
            return errorResponse(res, 403, 'امکان مسدود کردن کاربر ادمین وجود ندارد');
        }

        await User.findByIdAndDelete(userId);
        await Ban.create({ phone: user.phone });

        return successRespons(res, 200, {
            user,
            message: 'کاربر با موفقیت مسدود شد و اطلاعات حذف گردید',
        });

    } catch (err) {
        next(err);
    }
};

exports.changeRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه کاربر نامعتبر است');

        const user = await User.findById(id);
        if (!user) return errorResponse(res, 404, 'کاربر یافت نشد');

        const newRole = user.roles.includes('ADMIN') ? 'USER' : 'ADMIN';
        const updatedUser = await User.findByIdAndUpdate(id, { roles: newRole }, { new: true });

        return successRespons(res, 200, {
            user: updatedUser,
            message: 'نقش کاربر با موفقیت تغییر یافت',
        });

    } catch (err) {
        next(err);
    }
};

exports.createAddress = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, postalCode, province, city, street } = req.body;

        await createAddressValidator.validate(req.body, { abortEarly: false });

        const cityData = cities.find(c => c.name === city);
        if (!cityData) return errorResponse(res, 409, 'شهر وارد شده معتبر نیست');

        const addressObject = { name, postalCode, province, city, street };
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { addresses: addressObject } },
            { new: true }
        );

        return successRespons(res, 201, {
            user: updatedUser,
            message: 'آدرس با موفقیت ایجاد شد',
        });

    } catch (err) {
        next(err);
    }
};

exports.removeAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);

        const address = user.addresses.id(addressId);
        if (!address) return errorResponse(res, 404, 'آدرس یافت نشد');

        await user.addresses.pull(addressId);
        const updatedUser = await user.save();

        return successRespons(res, 200, {
            user: updatedUser,
            message: 'آدرس با موفقیت حذف شد',
        });

    } catch (err) {
        next(err);
    }
};

exports.updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const { addressId } = req.params;
        const { name, postalCode, province, city, street } = req.body;

        await updateAddressValidator.validate(req.body, { abortEarly: false });

        const userAddress = user.addresses.id(addressId);
        if (!userAddress) return errorResponse(res, 404, 'آدرس یافت نشد');

        userAddress.name = name || userAddress.name;
        userAddress.province = province || userAddress.province;
        userAddress.postalCode = postalCode || userAddress.postalCode;
        userAddress.city = city || userAddress.city;
        userAddress.street = street || userAddress.street;

        const updatedUser = await user.save();

        return successRespons(res, 200, {
            user: updatedUser,
            message: 'آدرس با موفقیت بروزرسانی شد',
        });

    } catch (err) {
        next(err);
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه کاربر نامعتبر است');

        const { username, phone } = req.body;
        if (!username && !phone) return errorResponse(res, 400, 'هیچ داده‌ای برای بروزرسانی ارسال نشده است');

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username: username || undefined, phone: phone || undefined },
            { new: true }
        );

        if (!updatedUser) return errorResponse(res, 404, 'کاربر یافت نشد');

        return successRespons(res, 200, {
            user: updatedUser,
            message: 'اطلاعات کاربر با موفقیت بروزرسانی شد',
        });

    } catch (err) {
        next(err);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه کاربر نامعتبر است');

        const user = await User.findById(id);
        if (!user) return errorResponse(res, 404, 'کاربر یافت نشد');

        return successRespons(res, 200, { user });

    } catch (err) {
        next(err);
    }
};
