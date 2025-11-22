const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({});

module.exports = mongoose.model('BankAccount', bankAccountSchema);