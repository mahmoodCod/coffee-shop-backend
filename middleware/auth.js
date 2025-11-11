const jwt = require('jsonwebtoken');
const User = require('../model/User');

exports.auth = async (req,res,next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.st
        }

    } catch (err) {
        next(err);
    };
};
