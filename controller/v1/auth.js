const redis = require('../../redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../../services/otp');
const { sendOtpValidator, otpVerifyValidator } = require('../../validator/auth');
const { errorResponse, successRespons } = require('../../helpers/responses');

// Optional models - comment out if not created yet
let Ban = null;
let User = null;

try {
  Ban = require('../../model/Ban');
} catch (err) {
  // Ban model not found - will skip ban check
  console.log('Ban model not found - ban check will be skipped');
}

try {
  User = require('../../model/User');
  // If User is null (placeholder), set it to null
  if (User === null) {
    User = null;
    console.log('User model is placeholder - verify and getMe endpoints will not work');
  }
} catch (err) {
  // User model not found - verify and getMe will not work
  console.log('User model not found - verify and getMe endpoints will not work');
}

function getOtpRedisPattern(phone) {
    return `OTP: ${phone}`;
};
async function getOtpDetails(phone) {
    const otp = await redis.get(getOtpRedisPattern(phone));

    if (!otp) {
        return {
            expired: true,
            remainingTime: 0,
        };
    };
    const remainingTime =  await redis.ttl(getOtpRedisPattern(phone));// second
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60; // 01:20
    const formattedTime = `${minutes.toString().padStart(2,'0')}: ${seconds.toString().padStart(2,'0')}`;

    return {
        expired: false,
        remainingTime: formattedTime,
    };
};

const genarateOtp = async(phone, length = 6, expireTime = 2) => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0 ; i < length ; i++) {
        const index = Math.floor(Math.random() * digits.length);
        otp += digits[index];
    };

    const hashedOtp = await bcrypt.hash(otp,12);

    await redis.set(getOtpRedisPattern(phone), hashedOtp, 'EX', expireTime * 60);

    return otp;
};


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

        const { expired,remainingTime } = await getOtpDetails(phone);

        if (!expired) {
            return successRespons(res, 200, {message: `OTP already send, please try again afetr ${remainingTime}`});
        };

        const otp = await genarateOtp(phone);

        await sendSms(phone,otp);

        return successRespons(res,200,{message: 'otp send successfully :))'});
    } catch (err) {
        next(err);
    };
};

exports.verify = async (req,res,next) => {
    try {
        const { phone, otp } = req.body;
    
        await otpVerifyValidator.validate(req.body, { abortEarly: false });
    
        const savedOtp = await redis.get(getOtpRedisPattern(phone));
    
        if (!savedOtp) {
          return errorResponse(res, 400, "Wrong or expired OTP");
        }
    
        const otpIsCorrect = await bcrypt.compare(otp, savedOtp);
    
        if (!otpIsCorrect) {
          return errorResponse(res, 400, "Wrong or expired OTP !!");
        }
    
        // consume OTP on success to prevent reuse
        await redis.del(getOtpRedisPattern(phone));

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
          message: "User registed successfully :))",
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

