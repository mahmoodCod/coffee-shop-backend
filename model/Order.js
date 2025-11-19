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
    },
    postTrackingCode: {
        type: String
    },
    status: {
        type: String,
        enum: ["PROCESSING", "SHIPPED", "DELIVERED"],
        default: "PROCESSING",
    },
    authority: {
        type: String,
        unique: true,
        required: true
    },
});

orderSchema.virtual("totalPrice").get(function() {
    return this.items.reduce((total,item) => {
        return total + item.priceAtTimeOfAdding * item.quantity;
    }, 0);
});

const order = mongoose.model('Order', orderSchema);