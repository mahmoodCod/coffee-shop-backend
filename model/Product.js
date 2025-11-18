const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({});

const product = mongoose.model('Product', productSchema);

module.exports = product;