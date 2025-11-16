const redis = require('../redis');
const request = require('request');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSms = async (phone, otp) => {
  try {
    const smsEnabled = process.env.SMS_ENABLED === 'true';
    const smsProvider = process.env.SMS_PROVIDER || 'sms.ir';
    const smsApiUrl = process.env.SMS_API_URL;

    // Normalize phone to 09xxxxxxxxx
    let normalizedPhone = phone.toString().trim();
    normalizedPhone = normalizedPhone.replace(/[\s\-]/g, '');
    if (normalizedPhone.startsWith('+98')) {
      normalizedPhone = '0' + normalizedPhone.substring(3);
    } else if (normalizedPhone.startsWith('0098')) {
      normalizedPhone = '0' + normalizedPhone.substring(4);
    } else if (normalizedPhone.startsWith('98') && normalizedPhone.length === 12) {
      normalizedPhone = '0' + normalizedPhone.substring(2);
    }
    if (!normalizedPhone.startsWith('0') && normalizedPhone.length === 10) {
      normalizedPhone = '0' + normalizedPhone;
    }

    if (smsProvider === 'sms.ir') {
      const smsIrApiKey = process.env.SMS_IR_API_KEY || '';
      const smsIrTemplateId = process.env.SMS_IR_TEMPLATE_ID || '';

      if (!smsEnabled || !smsIrApiKey || !smsIrTemplateId) {
        return { success: true, message: 'OTP logged (development mode)' };
      }

      // Template-based OTP (required)
      const verifyApiUrl = smsApiUrl || 'https://api.sms.ir/v1/send/verify';
      const options = {
        url: verifyApiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': smsIrApiKey,
        },
        json: {
          mobile: normalizedPhone,
          templateId: Number(smsIrTemplateId),
          parameters: [
            { name: 'OTP', value: String(otp) }
          ]
        }
      };

      return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
          if (error) {
            reject(error);
          } else if (response.statusCode !== 200 && response.statusCode !== 201) {
            reject(new Error(`SMS API returned status ${response.statusCode}`));
          } else {
            try {
              const result = typeof body === 'string' ? JSON.parse(body) : body;
              if ((result && result.status === 'success') || result?.status === true || result?.statusCode === 200) {
                resolve({ success: true, messageId: result.messageId || result.data?.messageId || Date.now(), body: result });
              } else {
                const errorMsg = result?.message || result?.Message || `SMS API error: ${JSON.stringify(result)}`;
                reject(new Error(errorMsg));
              }
            } catch (e) {
              reject(new Error(`SMS API error: Failed to parse response - ${JSON.stringify(body)}`));
            }
          }
        });
      });
    } else {
      const customApiKey = process.env.SMS_API_KEY || '';
      
      if (!smsEnabled || !smsApiUrl || !customApiKey) {
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

const storeOTP = async (phone, otp, expirySeconds = 300) => {
  try {
    const key = `otp:${phone}`;
    await redis.setex(key, expirySeconds, otp);
    return true;
  } catch (error) {
    throw error;
  }
};

const getOTP = async (phone) => {
  try {
    const key = `otp:${phone}`;
    const otp = await redis.get(key);
    return otp;
  } catch (error) {
    throw error;
  }
};

const deleteOTP = async (phone) => {
  try {
    const key = `otp:${phone}`;
    await redis.del(key);
    return true;
  } catch (error) {
    throw error;
  }
};

exports.sendOTP = async (phone) => {
  try {
    const otp = generateOTP();
    await storeOTP(phone, otp, 300);
    await sendSms(phone, otp);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    throw error;
  }
};

exports.verifyOTP = async (phone, otp) => {
  try {
    const storedOTP = await getOTP(phone);
    
    if (!storedOTP) {
      return { success: false, message: 'OTP expired or not found' };
    }
    
    if (storedOTP !== otp) {
      return { success: false, message: 'Invalid OTP code' };
    }
    
    await deleteOTP(phone);
    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    throw error;
  }
};

exports.sendSms = sendSms;
exports.generateOTP = generateOTP;
exports.storeOTP = storeOTP;
exports.getOTP = getOTP;
exports.deleteOTP = deleteOTP;

