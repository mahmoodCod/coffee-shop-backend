const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
      },
    
      slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },
    
      description: {
        type: String,
        trim: true,
        required: true,
      },
    
      image: {
        type: String,
        required: true,
        default: '/images/categories/default.jpg'
      },
    
      color: {
        type: String,
        required: true,
        default: '#8B4513'
      },
    
      icon: {
        type: {
            filename: { type: String, trim: true },
            path: { type: String, trim: true },
        },
      },

      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
      },
    
      order: {
        type: Number,
        default: 0
      },
    
      isActive: {
        type: Boolean,
        default: true
      },
    
      showOnHomepage: {
        type: Boolean,
        default: false
      },
    
      // SEO metadata
      seo: {
        metaTitle: {
          type: String,
          maxlength: 70
        },
        metaDescription: {
          type: String,
          maxlength: 160
        },
        metaKeywords: [String]
      },
    
      productsCount: {
        type: Number,
        default: 0
      }
    
    }, {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    });
    
    // Create indexes for faster search
    categorySchema.index({ name: 1 });
    categorySchema.index({ slug: 1 });
    categorySchema.index({ parent: 1 });
    categorySchema.index({ isActive: 1, order: 1 });
    
    // Virtual for getting subcategories
    categorySchema.virtual('subcategories', {
      ref: 'Category',
      localField: '_id',
      foreignField: 'parent'
    });
    
    // Pre-save middleware for auto slug generation
    categorySchema.pre('save', function(next) {
      if (this.isModified('name') && !this.slug) {
        // Convert Persian name to slug (you can use slugify library)
        this.slug = this.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u0600-\u06FF-]+/g, '');
      }
      next();
    });
    
    // Method to get all parents
    categorySchema.methods.getParentTree = async function() {
      const parents = [];
      let current = this;
      
      while (current.parent) {
        current = await mongoose.model('Category').findById(current.parent);
        if (current) parents.unshift(current);
      }
      
      return parents;
    };
    
    // Static method to get root categories
    categorySchema.statics.getRootCategories = function() {
      return this.find({ parent: null, isActive: true }).sort({ order: 1 });
    };
    
    // Static method to get complete category tree
    categorySchema.statics.getCategoryTree = async function() {
      const categories = await this.find({ isActive: true }).sort({ order: 1 }).lean();
      
      const buildTree = (parentId = null) => {
        return categories
          .filter(cat => {
            if (parentId === null) return cat.parent === null || cat.parent === undefined;
            return cat.parent && cat.parent.toString() === parentId.toString();
          })
          .map(cat => ({
            ...cat,
            children: buildTree(cat._id)
          }));
      };
      
      return buildTree();

}, { timestamps: true };

module.exports = mongoose.model('Category', categorySchema);