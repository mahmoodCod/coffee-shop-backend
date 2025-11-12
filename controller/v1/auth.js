
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

