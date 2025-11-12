const redis = require('../../redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../../services/otp');
const { sendOtpValidator } = require('../../validator/auth');
const { errorResponse, successRespons } = require('../../helpers/responses');
// const Ban = require('../../model/Ban'); // TODO: Create Ban model if needed

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

        // TODO: Uncomment when Ban model is created
        // const Ban = require('../../model/Ban');
        // const isBanned = await Ban.findOne({ phone });
        // if (isBanned) {
        //     return errorResponse(res, 403, 'This phone number has been banned');
        // };

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

    } catch (err) {
        next(err);
    };
};

exports.getMe = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

