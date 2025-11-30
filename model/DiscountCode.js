const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    percentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('DiscountCode', discountCodeSchema);