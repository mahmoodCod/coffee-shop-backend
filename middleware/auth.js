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

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return errorResponse(res, 401, "توکن ارسال نشده است!");
    }

    const tokenArray = token.split(" ");
    const tokenValue = tokenArray[1];

    if (tokenArray[0] !== "Bearer") {
      return errorResponse(
        res,
        401,
        "لطفاً عبارت [Bearer ] را در ابتدای توکن قرار دهید"
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    } catch (e) {
      return errorResponse(res, 401, "توکن معتبر نیست یا منقضی شده است!");
    }

    if (!decoded) {
      return errorResponse(res, 401, "توکن معتبر نیست!");
    }

    const userId = decoded.userId;

    // Check if User model is available
    if (!User) {
      return errorResponse(res, 500, "مدل User موجود نیست. لطفاً مدل User را ایجاد کنید.");
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 404, "کاربر یافت نشد!");
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};
