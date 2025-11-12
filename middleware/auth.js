const jwt = require('jsonwebtoken');
const { errorResponse } = require('../helpers/responses');

// Optional User model
let User = null;
try {
  User = require('../model/User');
  // If User is null (placeholder), set it to null
  if (User === null) {
    User = null;
  }
} catch (err) {
  // User model not found
  console.log('User model not found - auth middleware will not work');
}

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

        const userId = decoded.userId;

        // Check if User model is available
        if (!User) {
          return errorResponse(res, 500, "User model not available. Please create User model.");
        }

        const user = await User.findOne({ _id: userId });

        if (!user) {
          return errorResponse(res, 404, "User not found !!");
        }

        req.user = user;

        next();
    } catch (err) {
        next(err);
    };
};
