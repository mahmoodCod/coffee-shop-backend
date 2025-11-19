const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    excerpt: { 
        type: String, 
        required: true,
    },
    discription: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    href: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    badge: { 
        type: String, 
        default: "", 
    },
    readTime: { 
        type: String, 
        default: "", 
    },
    author: { 
        type: String, 
        required: true,
    },
    date: { 
        type: Date, 
        default: Date.now,
    },
    publish: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);