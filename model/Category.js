const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    
});

const category = mongoose.model('Category', categorySchema);

exports.module = category;