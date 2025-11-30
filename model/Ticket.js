const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    departmentSubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DepartmentSub',
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: false,
    },
    isAnswered: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['open', 'answered', 'closed'],
        default: 'open',
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);