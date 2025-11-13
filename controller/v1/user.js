const { createAddressValidator } = require('../../validator/address');
const cities = require('../../cities/cities.json')

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

