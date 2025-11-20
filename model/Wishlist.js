const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({});

module.exports = mongoose.model('Wishlist', wishlistSchema);