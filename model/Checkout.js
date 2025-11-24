const { default: mongoose } = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    items: [],

    shippingAddress: {
        type: checkoutAddressSchema,
        required: true,
    },

    authority: {
        type: String,
        unique: true,
        required: true,
    },

    expiresAt: {
        type: Date,
        required: true,
        default: () => Date.now() + 30 * 60 * 1000, // 30 دقیقه
    },
}, { timestamps: true });