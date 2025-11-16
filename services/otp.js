const axios = require('axios');

const sendSms = async (phone, otp) => {
  try {
    const smsEnabled = process.env.SMS_ENABLED === 'true';
    const smsIrApiKey = (process.env.SMS_IR_API_KEY || '').trim();
    const smsIrTemplateId = (process.env.SMS_IR_TEMPLATE_ID || '').trim();
    const smsIrParamName = (process.env.SMS_IR_PARAM_NAME || 'OTP').trim();

    console.log('\n========== SMS SEND ATTEMPT ==========');
    console.log('Phone:', phone);
    console.log('OTP:', otp);
    console.log('SMS_ENABLED:', smsEnabled);
    console.log('API_KEY exists:', !!smsIrApiKey);
    console.log('API_KEY (first 10 chars):', smsIrApiKey.substring(0, 10) + '...');
    console.log('TEMPLATE_ID:', smsIrTemplateId);
    console.log('PARAM_NAME:', smsIrParamName);

    if (!smsEnabled || !smsIrApiKey || !smsIrTemplateId) {
      console.log('[DEV MODE] SMS disabled or missing config');
      console.log('========================================\n');
      return { success: true, message: 'OTP logged (development mode)' };
    }

    // Normalize phone
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

    console.log('Normalized Phone:', normalizedPhone);

    const requestBody = {
      mobile: normalizedPhone,
      templateId: Number(smsIrTemplateId),
      parameters: [
        { name: smsIrParamName, value: String(otp) }
      ]
    };

    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('Sending to: https://api.sms.ir/v1/send/verify');

    const response = await axios.post('https://api.sms.ir/v1/send/verify', requestBody, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': smsIrApiKey,
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('========================================\n');

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
    console.log('========== SMS SEND ERROR ==========');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      const details = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : String(error.response.data);
      console.log('========================================\n');
      throw new Error(`SMS.ir error ${error.response.status}: ${details}`);
    }
    console.log('Error:', error.message);
    console.log('========================================\n');
    throw error;
  }
};

exports.sendSms = sendSms;