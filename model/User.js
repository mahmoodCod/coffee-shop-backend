const mongoose = require('mongoose');

const addressesSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        enum: ['admin', 'user'],
        default: ['user'],
    },
    addresses: [addressesSchema],
}, {timestamps : true});

