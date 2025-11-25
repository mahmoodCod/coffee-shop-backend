
exports.createPayment = async function ({ amountInRial, description, mobile }) {
    try {
        const response = await fetch(`${process.env.ZARINPAL_API_BASE_URL}/request.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
                callback_url: process.env.ZARINPAL_PAYMENT_CALLBACK_URL,
                amount: amountInRial,
                description,
                metadata: { mobile },
            }),
        });

        const data = await response.json();

        if (!data.data || !data.data.authority) {
            throw new Error('Failed to get authority from ZarinPal');
        }

        return {
            authority: data.data.authority,
            paymentUrl: process.env.ZARINPAL_PAYMENT_BASE_URL + data.data.authority,
        };
    } catch (err) {
        throw new Error(err.message || err);
    }
};

exports.verifyPayment = async function ({ amountInRial, authority }) {
    try {
        const response = await fetch(`${process.env.ZARINPAL_API_BASE_URL}/verify.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
                amount: amountInRial,
                authority,
            }),
        });

        const responseData = await response.json();

        if (!responseData.data) {
            throw new Error('Failed to verify payment');
        }

        return responseData.data;
    } catch (err) {
        throw new Error(err.message || err);
    }
};
