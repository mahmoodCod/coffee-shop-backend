const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({});

const order = mongoose.model('Order', orderSchema);