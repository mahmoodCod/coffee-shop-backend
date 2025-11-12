const redis = require('../redis');
const request = require('request');

// Generate random OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS using SMS service
const sendSms = async (phone, otp) => {
  try {
    // TODO: Replace with your SMS service API
    // Example SMS service integration
    const smsUrl = process.env.SMS_API_URL;
    const smsApiKey = process.env.SMS_API_KEY;
    
    if (!smsUrl || !smsApiKey) {
      console.log(`OTP for ${phone}: ${otp}`); // Fallback: log OTP for development
      return true;
    }

    const options = {
      url: smsUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smsApiKey}`
      },
      json: {
        phone: phone,
        message: `Your OTP code is: ${otp}`,
        otp: otp
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

// Store OTP in Redis with expiration
const storeOTP = async (phone, otp, expirySeconds = 300) => {
  try {
    const key = `otp:${phone}`;
    await redis.setex(key, expirySeconds, otp);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get OTP from Redis
const getOTP = async (phone) => {
  try {
    const key = `otp:${phone}`;
    const otp = await redis.get(key);
    return otp;
  } catch (error) {
    throw error;
  }
};

// Delete OTP from Redis
const deleteOTP = async (phone) => {
  try {
    const key = `otp:${phone}`;
    await redis.del(key);
    return true;
  } catch (error) {
    throw error;
  }
};

// Send OTP to phone number
exports.sendOTP = async (phone) => {
  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in Redis with 5 minutes expiration
    await storeOTP(phone, otp, 300);
    
    // Send SMS
    await sendSms(phone, otp);
    
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    throw error;
  }
};

// Verify OTP
exports.verifyOTP = async (phone, otp) => {
  try {
    // Get OTP from Redis
    const storedOTP = await getOTP(phone);
    
    if (!storedOTP) {
      return { success: false, message: 'OTP expired or not found' };
    }
    
    if (storedOTP !== otp) {
      return { success: false, message: 'Invalid OTP code' };
    }
    
    // Delete OTP after successful verification
    await deleteOTP(phone);
    
    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    throw error;
  }
};

// Export helper functions if needed
exports.generateOTP = generateOTP;
exports.storeOTP = storeOTP;
exports.getOTP = getOTP;
exports.deleteOTP = deleteOTP;

