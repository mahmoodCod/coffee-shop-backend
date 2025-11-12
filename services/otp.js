const redis = require('../redis');
const request = require('request');

// Generate random OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS using SMS service (Farapayamak or custom SMS service)
const sendSms = async (phone, otp) => {
  try {
    const smsProvider = process.env.SMS_PROVIDER || 'farapayamak'; // 'farapayamak' or 'custom'
    const smsApiUrl = process.env.SMS_API_URL;

    let options = {};

    if (smsProvider === 'farapayamak') {
      // Farapayamak API integration
      // Documentation: https://farapayamak.ir/
      // API URL: https://rest.payamak-panel.com/api/SendSMS/SendSMS
      // Alternative: https://api.farapayamak.ir/v1/SendSMS
      const farapayamakApiUrl = smsApiUrl || 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';
      const message = `کد تایید شما: ${otp}`;
      const farapayamakUsername = process.env.FARAPAYAMAK_USERNAME || '';
      const farapayamakPassword = process.env.FARAPAYAMAK_PASSWORD || '';
      const farapayamakSender = process.env.FARAPAYAMAK_SENDER_NUMBER || '';
      
      // If no username or password, use development mode
      if (!farapayamakUsername || !farapayamakPassword) {
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        return { success: true, message: 'OTP logged (development mode - no credentials)' };
      }
      
      options = {
        url: farapayamakApiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          username: farapayamakUsername,
          password: farapayamakPassword,
          to: phone,
          from: farapayamakSender,
          text: message
        }
      };
    } else {
      // Custom SMS service integration
      const customApiKey = process.env.SMS_API_KEY || '';
      
      if (!smsApiUrl || !customApiKey) {
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        return { success: true, message: 'OTP logged (development mode - no custom SMS config)' };
      }
      
      options = {
        url: smsApiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customApiKey}`
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
          // Farapayamak API returns a numeric response
          // If response > 1000, it means success
          // If response < 0, it means error
          const result = typeof body === 'string' ? parseInt(body, 10) : body;
          
          if (result > 1000) {
            console.log('SMS sent successfully:', body);
            resolve({ success: true, messageId: result, body });
          } else {
            console.error('SMS API error response:', body);
            reject(new Error(`SMS API error: ${body}`));
          }
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

