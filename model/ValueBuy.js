const mongoose = require('mongoose');

const valueBuySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    features: {
        type: [String],
        enum: ["recommended", "specialDiscount", "lowStock", "rareDeal"],
        default: []
    },
    
    filters: {
        type: [String],
        enum: ["economicChoice", "bestValue", "topSelling", "freeShipping"],
        default: []
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true , strict: true});

module.exports = mongoose.model('ValueBuy', valueBuySchema);