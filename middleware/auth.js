const jwt = require('jsonwebtoken');
const User = require('../model/User');
const { errorResponse } = require('../helpers/responses')

exports.auth = async (req,res,next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return errorResponse(res, 401, "Token not provided !!");
        };

        const tokenArray = token.split(" ");
        const tokenValue = tokenArray[1];

        if (tokenArray[0] !== "Bearer") {
            return errorResponse(
              res,
              401,
              "Write [Bearer ] at the start ot the token"
            );
        };

        let decoded;
        try {
            decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        } catch (e) {
            return errorResponse(res, 401, "Token is not valid or expired !!");
        };

        if (!decoded) {
            return errorResponse(res, 401, "Token is not valid !!");
        };

    } catch (err) {
        next(err);
    };
};
