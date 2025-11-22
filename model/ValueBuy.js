const mongoose = require('mongoose');

const valueBuySchema = new mongoose.Schema({});

module.exports = mongoose.model('ValueBuy', valueBuySchema);