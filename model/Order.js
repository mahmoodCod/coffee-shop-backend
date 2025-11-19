const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shippingAddress: {
        postalCode: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: String,
                required: true
            },
            lng: {
                type: String,
                required: true
            },
        },
        address: {
            type: String,
            required: true
        },
        cityId: {
            type: Number,
            required: true
        },
    }
});

const order = mongoose.model('Order', orderSchema);