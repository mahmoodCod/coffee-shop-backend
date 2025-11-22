const mongoose = require('mongoose');

const valueBuySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    features: {
        recommended: { type: Boolean, default: false },
        specialDiscount: { type: Boolean, default: false },
        lowStock: { type: Boolean, default: false },
        rareDeal: { type: Boolean, default: false }
    },

    filters: {
        economicChoice: { type: Boolean, default: false },
        bestValue: { type: Boolean, default: false },
        topSelling: { type: Boolean, default: false },
        freeShipping: { type: Boolean, default: false }
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true , strict: true});

module.exports = mongoose.model('ValueBuy', valueBuySchema);