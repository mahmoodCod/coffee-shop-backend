const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../../services/otp');
const { sendOtpValidator, otpVerifyValidator } = require('../../validator/auth');
const { errorResponse, successRespons } = require('../../helpers/responses');

// Optional models - comment out if not created yet
let Ban = null;
let User = null;

try {
  Ban = require('../../model/Ban');
} catch (err) {
  // Ban model not found - will skip ban check
}

try {
  User = require('../../model/User');
  // If User is null (placeholder), set it to null
  if (User === null) {
    User = null;
  }
} catch (err) {
  // User model not found - verify and getMe will not work
}


exports.send = async (req,res,next) => {
    try {
        const { phone } = req.body;

        await sendOtpValidator.validate(req.body, {abortEarly: false});

        // Ban check - skip if Ban model not available
        if (Ban) {
            const isBanned = await Ban.findOne({ phone });
            if (isBanned) {
                return errorResponse(res, 403, 'This phone number has been banned');
            }
        }

        await sendOTP(phone);

        return successRespons(res,200,{message: 'OTP sent successfully'});
    } catch (err) {
        next(err);
    };
};

exports.verify = async (req,res,next) => {
    try {
        const { phone, otp } = req.body;

        await otpVerifyValidator.validate(req.body, { abortEarly: false });

        const otpResult = await verifyOTP(phone, otp);

        if (!otpResult.success) {
          return errorResponse(res, 400, otpResult.message);
        }

        // User operations - skip if User model not available
        if (!User) {
            return errorResponse(res, 500, 'User model not available. Please create User model.');
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            {
              expiresIn: "30d",
            }
          );

          return successRespons(res, 200, { user: existingUser, token });
        }

        //* Register
        const isFirstUser = (await User.countDocuments()) === 0;

        const user = await User.create({
          phone,
          username: phone,
          roles: isFirstUser && process.env.ALLOW_FIRST_ADMIN === 'true'
            ? ["ADMIN"]
            : ["USER"],
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });

        return successRespons(res, 201, {
          message: "User registered successfully",
          token,
          user,
        });
    } catch (err) {
        next(err);
    };
};

exports.getMe = async (req,res,next) => {
    try {
        // User is already set by auth middleware
        const user = req.user;

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        return successRespons(res, 200, { user });
    } catch (err) {
        next(err);
    };
};

