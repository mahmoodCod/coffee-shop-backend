const { default: mongoose } = require("mongoose");

const checkoutAddressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
});

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