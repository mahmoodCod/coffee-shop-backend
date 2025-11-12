const mongoose = require('mongoose');

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

