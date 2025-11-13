const { createAddressValidator, updateAddressValidator } = require('../../validator/address');
const cities = require('../../cities/cities.json');
const { errorResponse, successRespons } = require('../../helpers/responses');
const User = require('../../model/User');
const { createPaginationData } = require('../../utils')
const Ban = require('../../model/Ban');
const { isValidObjectId } = require('mongoose');

exports.getAll = async(req,res,next) => {
    try {
        let { page = 1, limit = 10,  } = req.query;

        const users = await User.find({}).skip((page - 1) * limit).limit(limit);

        const totalUsers = await User.countDocuments();

        return successRespons(res,200, {
            users,
            pagination: createPaginationData(page, limit, totalUsers, 'Users'),
        });

    } catch (err) {
        next(err);
    };
};

exports.banUser = async(req,res,next) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return errorResponse(res, 404, "User not found !!");
        };

        if (user.roles.includes("ADMIN")) {
            return errorResponse(res, 403, "You cannot ban an admin !!");
        };

        const deletedUser = await User.findOneAndDelete({ _id: userId });

        await Ban.create({ phone: user.phone });

        return successRespons(res, 200, {
            user: deletedUser,
            message: "User banned successfully, user and posts removed",
        });

    } catch (err) {
        next(err);
    };
};

exports.changeRole = async(req,res,next) => {
    try {
        const { id } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res,400, "Invalid user id !!");
        };

        const user = await User.findOne({ _id : id });
    } catch (err) {
        next(err);
    };
};

exports.createAddress = async(req,res,next) => {
    try {
        const user = req.user;

        const { name, postalCode, province, city, street } = req.body;

        await createAddressValidator.validate( req.body, { abortEarly: false } );

        const cityData = cities.find((cityItem) => cityItem.name === city);
        if (!cityData) {
            return errorResponse(res,409, "City is not valid !!");
        };

        const addressObject = {
            name,
            postalCode,
            province,
            city,
            street
        };

        const updatedUser = await User.findByIdAndUpdate( user._id, {
            $push: {
                addresses: addressObject,
            },
        },
        {
            new: true,
        },
    );

    return successRespons(res,201, { user: updatedUser, message:'Address create successfully :))'});

    } catch (err) {
        next(err);
    };
};

exports.removeAddress = async(req,res,next) => {
    try {
        const { addressId } = req.params;

        const user = await User.findOne({ _id: req.user._id });

        const address = user.addresses.id(addressId);
        if(!address) {
            return errorResponse(res,404, 'Address not found !!');
        };

        await user.addresses.pull(addressId);

        const updatedUser = await user.save();

        return successRespons(res,200, {
            user: updatedUser,
            message: 'Address deleted successfully :))'
        });

    } catch (err) {
        next(err);
    };
};

exports.updateAddress = async(req,res,next) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        const { addressId } = req.params;

        const { name, postalCode, province, city, street } = req.body;

        await updateAddressValidator.validate(req.body, { abortEarly: false });

        const userAddress = user.addresses.id(addressId);

        if(!userAddress) {
            return errorResponse(res,404, 'Address not found !!');
        };

        userAddress.name = name || userAddress.name;
        userAddress.province = province || userAddress.province;
        userAddress.postalCode = postalCode || userAddress.postalCode;
        userAddress.city = city || userAddress.city;
        userAddress.street = street || userAddress.street;

        const updateAddress = await user.save();

        return successRespons(res,200, {
          user:updateAddress,
          message: 'Address updated successfully :))',
        });

    } catch (err) {
        next(err);
    };
};

