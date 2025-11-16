const axios = require('axios');

const sendSms = async (phone, otp) => {
  try {
    const smsEnabled = process.env.SMS_ENABLED === 'true';
    const smsIrApiKey = (process.env.SMS_IR_API_KEY || '').trim();
    const smsIrTemplateId = (process.env.SMS_IR_TEMPLATE_ID || '').trim();
    const smsIrParamName = (process.env.SMS_IR_PARAM_NAME || 'OTP').trim();

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

    const response = await axios.post('https://api.sms.ir/v1/send/verify', {
      mobile: normalizedPhone,
      templateId: smsIrTemplateId, // send as string
      parameters: [
        { name: smsIrParamName, value: String(otp) }
      ]
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': smsIrApiKey,
      }
    });

    if (response.status === 200 || response.status === 201) {
      const result = response.data;
      if ((result && result.status === 'success') || result?.status === true || result?.statusCode === 200) {
        return { success: true, messageId: result.messageId || result.data?.messageId || Date.now(), body: result };
      } else {
        const errorMsg = result?.message || result?.Message || `SMS API error: ${JSON.stringify(result)}`;
        throw new Error(errorMsg);
      }
    } else {
      throw new Error(`SMS API returned status ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      const details = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : String(error.response.data);
      throw new Error(`SMS.ir error ${error.response.status}: ${details}`);
    }
    throw error;
  }
};

exports.sendSms = sendSms;

