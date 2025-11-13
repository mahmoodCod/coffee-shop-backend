const { createAddressValidator } = require('../../validator/address');
const cities = require('../../cities/cities.json');
const { errorResponse } = require('../../helpers/responses');

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

        const cityData = cities.find((city) => +city.id === +city);
        if (!cityData) {
            return errorResponse(res,409, "City is not valid !!");
        };

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

