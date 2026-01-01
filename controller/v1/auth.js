const redis = require('../../redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../../services/otp');
const { sendOtpValidator, otpVerifyValidator } = require('../../validator/auth');
const { errorResponse, successRespons } = require('../../helpers/responses');

// Optional models
let Ban = null;
let User = null;

try {
  Ban = require('../../model/Ban');
} catch (err) {
  // Ban model not found
}

try {
  User = require('../../model/User');
  if (User === null) {
    User = null;
  }
} catch (err) {
  // User model not found
}

// Redis key pattern
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
  }

  const remainingTime = await redis.ttl(getOtpRedisPattern(phone));
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const formattedTime = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

  return {
      expired: false,
      remainingTime: formattedTime,
  };
};

// Generate OTP
const genarateOtp = async (phone, length = 6, expireTime = 2) => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * digits.length);
      otp += digits[index];
  }

  const hashedOtp = await bcrypt.hash(otp, 12);

  await redis.set(getOtpRedisPattern(phone), hashedOtp, 'EX', expireTime * 60);

  return otp;
};


// ------------------------- SEND OTP -------------------------
exports.send = async (req, res, next) => {
  try {
    const { phone } = req.body;

    await sendOtpValidator.validate(req.body, { abortEarly: false });

    const { expired, remainingTime } = await getOtpDetails(phone);

    if (!expired) {
      return successRespons(res, 200, {
        message: `کد تأیید از قبل ارسال شده است؛ لطفاً پس از ${remainingTime} دوباره تلاش کنید.`,
      });
    }

    const otp = await genarateOtp(phone);

    try {
      await sendSms(phone, otp);
    } catch (smsErr) {
      console.log("SMS ERROR (OTP CREATED):", smsErr.message);
    }

    return successRespons(res, 200, {
      message: "کد تأیید با موفقیت ارسال شد",
    });

  } catch (err) {
    next(err);
  }
};


// ------------------------- VERIFY OTP -------------------------
exports.verify = async (req, res, next) => {
  try {
      const { phone, otp } = req.body;

      await otpVerifyValidator.validate(req.body, { abortEarly: false });

      const savedOtp = await redis.get(getOtpRedisPattern(phone));

      if (!savedOtp) {
        return errorResponse(res, 400, "کد تأیید اشتباه است یا منقضی شده");
      }

      const otpIsCorrect = await bcrypt.compare(otp, savedOtp);

      if (!otpIsCorrect) {
        return errorResponse(res, 400, "کد تأیید اشتباه است یا منقضی شده");
      }

      // Prevent OTP reuse
      await redis.del(getOtpRedisPattern(phone));

      // If user model isn’t available
      if (!User) {
          return errorResponse(res, 500, 'مدل User در سیستم وجود ندارد. لطفاً مدل را ایجاد کنید.');
      }

      // Login (user exists)
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        const token = jwt.sign(
          { userId: existingUser._id },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        return successRespons(res, 200, {
          user: existingUser,
          token,
        });
      }

      // Register
      const isFirstUser = (await User.countDocuments()) === 0;

      const user = await User.create({
        phone,
        username: phone,
        roles:
          isFirstUser && process.env.ALLOW_FIRST_ADMIN === 'true'
            ? ["ADMIN"]
            : ["USER"],
      });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return successRespons(res, 201, {
        message: "کاربر با موفقیت ثبت‌نام شد",
        token,
        user,
      });

  } catch (err) {
      next(err);
  }
};


// ------------------------- GET ME -------------------------
exports.getMe = async (req, res, next) => {
  try {
      const user = req.user;

      if (!user) {
        return errorResponse(res, 404, 'کاربر پیدا نشد');
      }

      return successRespons(res, 200, { user });

  } catch (err) {
      next(err);
  }
};
