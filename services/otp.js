const redis = require('../redis');
const request = require('request');

// Generate random OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS using SMS service (Faraz SMS or custom SMS service)
const sendSms = async (phone, otp) => {
  try {
    const smsProvider = process.env.SMS_PROVIDER || 'faraz'; // 'faraz' or 'custom'
    const smsApiKey = process.env.SMS_API_KEY;
    const smsApiUrl = process.env.SMS_API_URL;
    
    // If no API key or URL, log OTP for development
    if (!smsApiKey && !smsApiUrl) {
      console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
      return { success: true, message: 'OTP logged (development mode)' };
    }

    let options = {};

    if (smsProvider === 'faraz') {
      // Faraz SMS API integration
      // Documentation: https://docs.farazsms.com/
      const farazApiUrl = smsApiUrl || 'https://api.farazsms.com/v1/send';
      const message = `کد تایید شما: ${otp}`;
      
      options = {
        url: farazApiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${smsApiKey}`
        },
        json: {
          op: 'send', // Operation: send
          uname: process.env.FARAZ_USERNAME || '',
          pass: process.env.FARAZ_PASSWORD || '',
          message: message,
          to: [phone], // Array of phone numbers
          from: process.env.FARAZ_SENDER_NUMBER || '',
          // Optional: template_id for template messages
          // template_id: process.env.FARAZ_TEMPLATE_ID || ''
        }
      };
    } else {
      // Custom SMS service integration
      options = {
        url: smsApiUrl,
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
    }

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          console.error('SMS sending error:', error);
          reject(error);
        } else if (response.statusCode !== 200) {
          console.error('SMS API error:', response.statusCode, body);
          reject(new Error(`SMS API returned status ${response.statusCode}`));
        } else {
          console.log('SMS sent successfully:', body);
          resolve(body);
        }
      });
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
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
exports.sendSms = sendSms;
exports.generateOTP = generateOTP;
exports.storeOTP = storeOTP;
exports.getOTP = getOTP;
exports.deleteOTP = deleteOTP;

