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

    image: { 
        type: String, 
        default: '/images/default-product.jpg' 
    },

    images: { 
        type: [String], 
        default: [] 
    },

    seo: {
        title: { type: String },
        description: { type: String },
        keywords: { type: [String], default: [] }
    },
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