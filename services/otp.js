const request = require('request');

const sendSms = async (phone, otp) => {
  try {
    const smsEnabled = process.env.SMS_ENABLED === 'true';
    const smsIrApiKey = process.env.SMS_IR_API_KEY || '';
    const smsIrTemplateId = process.env.SMS_IR_TEMPLATE_ID || '';

    if (!smsEnabled || !smsIrApiKey || !smsIrTemplateId) {
      return { success: true, message: 'OTP logged (development mode)' };
    }

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

    const options = {
      url: 'https://api.sms.ir/v1/send/verify',
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
  } catch (error) {
    throw error;
  }
};

exports.sendSms = sendSms;

