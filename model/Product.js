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
        trim: true,
    },

    positiveFeature: {
        type: String,
        required: true,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    badge: {
        type: String,
        default: ""
    },

    images: {
        type: [String],
        default: []
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

    image: { 
        type: String, 
        default: '/images/default-product.jpg' 
    },

    seo: {
        title: { type: String },
        description: { type: String },
        keywords: { type: [String], default: [] }
    },

    weight: {
        type: Number,
        default: 0
    },

    ingredients: {
        type: String,
        default: ""
    },

    benefits: {
        type: String,
        default: ""
    },

    howToUse: {
        type: String,
        default: ""
    },

    hasWarranty: {
        type: Boolean,
        default: false,
    },

    warrantyDuration: {
        type: Number,
        default: 0,
    },

    warrantyDescription: {
        type: String,
        default: ""
    },

    userReviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String, trim: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],

    brand: {
        type: String,
        required: true,
        trim: true
    },
    
    recommended: {
        type: Boolean,
        default: false
    }    

}, { timestamps: true, toJSON: { virtuals: true },toObject: { virtuals: true } });

// Virtual: price after discount (computed)
productSchema.virtual('priceAfterDiscount').get(function() {
    if (!this.discount || this.discount <= 0) return this.price;
    const p = Math.round(this.price * (1 - (this.discount / 100)));
    return p;
  });
  
  // Indexes برای جستجوی سریع
  productSchema.index({ name: 'text', category: 1, badge: 1 });

const product = mongoose.model('Product', productSchema);

module.exports = product;