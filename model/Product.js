const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    description: {
        type: String,
        required: true,
        trime: true,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    images: {
        type: [
            {
                type: String,
                required: true
            },
        ],
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },

    price: {
        type: Number,
        required: true,
    },

    stock: {
        type: Number,
        required: true,
    },

    originalPrice: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },

    type: { 
        type: String,
        enum: ['regular','discount','premium'],
        default: 'regular' 
    },

    dealType: { 
        type: String, 
        default: '' 
    },     

    timeLeft: { 
        type: String, 
        default: '' 
    }, 

    soldCount: { 
        type: Number, 
        default: 0 
    },

    totalCount: { 
        type: Number, 
        default: 0 
    },

    rating: { 
        type: Number, 
        default: 0 
    },
    
    reviews: { 
        type: Number, 
        default: 0 
    },

    isPrime: { 
        type: Boolean, 
        default: false 
    },
    isPremium: { 
        type: Boolean, 
        default: false 
    },

    features: { 
        type: [String], 
        default: [] 
    },
});

const product = mongoose.model('Product', productSchema);

module.exports = product;