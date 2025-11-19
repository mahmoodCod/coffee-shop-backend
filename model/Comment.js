const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
});

const comment = mongoose.model('Comment', commentSchema);