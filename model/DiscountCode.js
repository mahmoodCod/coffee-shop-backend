const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model('DiscountCode', discountCodeSchema);