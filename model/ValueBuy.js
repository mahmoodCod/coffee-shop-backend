const mongoose = require('mongoose');

const valueBuySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    features: {
        type: [String],
        enum: ["پیشنهاد شده", "تخفیف ویژه", "موجودی کم", "پیشنهاد نادر"],
        default: ["پیشنهاد شده"]
    },
    
    filters: {
        type: [String],
        enum: ["انتخاب اقتصادی", "بهترین ارزش", "پرفروش‌ترین", "ارسال رایگان"],
        default: ["انتخاب اقتصادی"]
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true , strict: true});

module.exports = mongoose.model('ValueBuy', valueBuySchema);