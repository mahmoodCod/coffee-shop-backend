const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    cardNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    shebaNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    accountType: {
        type: String,
        enum: ['حساب جاری', 'پس‌انداز', 'دیگر'],
        default: 'حساب جاری'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);