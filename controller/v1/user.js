const { createAddressValidator } = require('../../validator/address');
const cities = require('../../cities/cities.json');
const { errorResponse, successRespons } = require('../../helpers/responses');
const User = require('../../model/User');

exports.getAll = async(req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.banUser = async(req,res,next) => {
    try {

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

    } catch (err) {
        next(err);
    };
};

exports.updateAddress = async(req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

