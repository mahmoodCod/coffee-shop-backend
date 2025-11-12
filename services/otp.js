const redis = require('../redis');
const request = require('request');

// Generate random OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS using SMS service (Farapayamak or custom SMS service)
const sendSms = async (phone, otp) => {
  try {
    // Check if SMS is enabled (set SMS_ENABLED=false to disable SMS sending)
    // Default: SMS is disabled (development mode)
    const smsEnabled = process.env.SMS_ENABLED === 'true';
    
    const smsProvider = process.env.SMS_PROVIDER || 'farapayamak'; // 'farapayamak' or 'custom'
    const smsApiUrl = process.env.SMS_API_URL;

    if (smsProvider === 'farapayamak') {
      // Farapayamak API integration
      // Documentation: https://farapayamak.ir/
      // API URL: http://rest.payamak-panel.com/api/SendSMS/SendSMS
      // Response format: {"Value":"messageId","RetStatus":0,"StrRetStatus":"Ok"}
      // RetStatus: 0 = success, other values = error
      // RetStatus 35 = InvalidData (wrong phone format, sender number, or parameters)
      const farapayamakUsername = process.env.FARAPAYAMAK_USERNAME || '';
      const farapayamakPassword = process.env.FARAPAYAMAK_PASSWORD || '';
      const farapayamakSender = process.env.FARAPAYAMAK_SENDER_NUMBER || '';
      
      // Development mode: If SMS is disabled or credentials are not provided, just log OTP
      if (!smsEnabled || !farapayamakUsername || !farapayamakPassword) {
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        return { success: true, message: 'OTP logged (development mode)' };
      }

      // Normalize phone number format for Iranian numbers
      // Farapayamak expects format: 09123456789 (starting with 0)
      let normalizedPhone = phone.toString().trim();
      // Remove any spaces or dashes
      normalizedPhone = normalizedPhone.replace(/[\s\-]/g, '');
      // Convert international format to local format
      if (normalizedPhone.startsWith('+98')) {
        normalizedPhone = '0' + normalizedPhone.substring(3);
      } else if (normalizedPhone.startsWith('0098')) {
        normalizedPhone = '0' + normalizedPhone.substring(4);
      } else if (normalizedPhone.startsWith('98') && normalizedPhone.length === 12) {
        normalizedPhone = '0' + normalizedPhone.substring(2);
      }
      // Ensure phone starts with 0 and has 11 digits
      if (!normalizedPhone.startsWith('0') && normalizedPhone.length === 10) {
        normalizedPhone = '0' + normalizedPhone;
      }

      const farapayamakApiUrl = smsApiUrl || 'http://rest.payamak-panel.com/api/SendSMS/SendSMS';
      const message = `کد تایید شما: ${otp}`;
      
      const options = {
        url: farapayamakApiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          username: farapayamakUsername,
          password: farapayamakPassword,
          to: normalizedPhone,
          from: farapayamakSender,
          text: message
        }
      };

      return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
          if (error) {
            console.error('SMS sending error:', error);
            reject(error);
          } else if (response.statusCode !== 200) {
            console.error('SMS API error:', response.statusCode, body);
            reject(new Error(`SMS API returned status ${response.statusCode}`));
          } else {
            try {
              // Farapayamak API returns JSON response
              // Format: {"Value":"messageId","RetStatus":0,"StrRetStatus":"Ok"}
              // RetStatus: 0 = success, other values = error
              let result;
              if (typeof body === 'string') {
                try {
                  result = JSON.parse(body);
                } catch (e) {
                  // If not JSON, try to parse as number
                  result = parseInt(body, 10);
                }
              } else {
                result = body;
              }

              // Check if response is JSON object with RetStatus
              if (result && typeof result === 'object' && 'RetStatus' in result) {
                // RetStatus can be number or string, convert to number for comparison
                const retStatus = typeof result.RetStatus === 'string' 
                  ? parseInt(result.RetStatus, 10) 
                  : result.RetStatus;
                
                if (retStatus === 0) {
                  console.log('SMS sent successfully:', result);
                  resolve({ success: true, messageId: result.Value, body: result });
                } else {
                  const errorMsg = result.StrRetStatus || `RetStatus: ${result.RetStatus}`;
                  console.error('SMS API error response:', result);
                  reject(new Error(`SMS API error: ${errorMsg}`));
                }
              } else if (typeof result === 'number' && result > 1000) {
                // Legacy numeric response format (success)
                console.log('SMS sent successfully:', result);
                resolve({ success: true, messageId: result, body });
              } else {
                // Unknown response format
                console.error('SMS API unknown response format:', body);
                reject(new Error(`SMS API error: Unknown response format - ${JSON.stringify(body)}`));
              }
            } catch (parseError) {
              console.error('SMS API response parse error:', parseError, body);
              reject(new Error(`SMS API error: Failed to parse response - ${body}`));
            }
          }
        });
      });
    } else {
      // Custom SMS service integration
      const customApiKey = process.env.SMS_API_KEY || '';
      
      // Development mode: If SMS is disabled or credentials are not provided, just log OTP
      if (!smsEnabled || !smsApiUrl || !customApiKey) {
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        return { success: true, message: 'OTP logged (development mode)' };
      }
      
      const options = {
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
            resolve({ success: true, messageId: body.id || body.messageId, body });
          }
        });
      });
    }
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

