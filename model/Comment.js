const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    replies: [replySchema],
}, { timestamps: true });

const comment = mongoose.model('Comment', commentSchema);

module.exports = comment;