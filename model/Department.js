const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const model = mongoose.model('department', schema);

module.exports = model;