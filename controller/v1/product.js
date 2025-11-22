const { createProductValidator, updateProductValidator } = require('../../validator/product');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Product = require('../../model/Product');
const Category = require('../../model/Category');
const { isValidObjectId } = require('mongoose');

const supportedFormat = [
    "image/jpeg",
    "image/svg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
];

exports.createProduct = async (req,res,next) => {
    try {
        const { 
            name, 
            slug, 
            description, 
            positiveFeature, 
            category, 
            brand,
            badge, 
            status, 
            price, 
            stock, 
            originalPrice, 
            discount, 
            type, 
            dealType, 
            timeLeft, 
            soldCount, 
            totalCount, 
            rating, 
            weight,
            ingredients,
            benefits,
            howToUse,
            hasWarranty,
            warrantyDuration,
            warrantyDescription,
            userReviews,
            isPrime, 
            isPremium, 
            features, 
            image, 
            seo 
        } = req.body;

        if (req.body.features && typeof req.body.features === 'string') {
            req.body.features = req.body.features
              .replace(/["']/g, '')
              .split(',')
              .map(f => f.trim())
              .filter(f => f);
        }

        // Validate request body
        await createProductValidator.validate(req.body, { abortEarly: false });

        // Check if slug already exists
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return errorResponse(res, 409, 'Product with this slug already exists');
        }

        // Validate category
        if (!isValidObjectId(category)) {
            return errorResponse(res, 400, 'Invalid category ID');
        }
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return errorResponse(res, 404, 'Category not found');
        }

        // Handle image uploads
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Validate file format
                if (!supportedFormat.includes(file.mimetype)) {
                    return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
                }
                imagePaths.push(file.path.replace(/\\/g, '/'));
            }
        }

        // Set main image (first uploaded image or default)
        const mainImage = imagePaths.length > 0 ? imagePaths[0] : (image || '/images/default-product.jpg');

        // Create product object
        const productData = {
            name,
            slug,
            description: description || '',
            positiveFeature,
            category,
            brand,
            badge: badge || '',
            status: status || 'inactive',
            price,
            stock,
            originalPrice: originalPrice || 0,
            discount: discount || 0,
            type: type || 'regular',
            dealType: dealType || '',
            timeLeft: timeLeft || '',
            soldCount: soldCount || 0,
            totalCount: totalCount || 0,
            rating: rating || 0,
            weight: weight || 0,
            ingredients: ingredients || '',
            benefits: benefits || '',
            howToUse: howToUse || '',
            hasWarranty: hasWarranty || false,
            warrantyDuration: warrantyDuration || 0,
            warrantyDescription: warrantyDescription || '',
            userReviews: userReviews || [],
            isPrime: isPrime || false,
            isPremium: isPremium || false,
            features: features || [],
            image: mainImage,
            images: imagePaths,
        };

        // Add SEO data if provided
        if (seo) {
            productData.seo = seo;
        }

        // Create product
        const newProduct = await Product.create(productData);

        return successRespons(res, 201, {
            product: newProduct,
            message: 'Product created successfully'
        });

    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError' && err.inner) {
            const validationErrors = err.inner.map(e => ({
                path: e.path,
                message: e.message
            }));
            return errorResponse(res, 400, 'Validation failed', validationErrors);
        }
        next(err);
    };
};

exports.getAllProduct = async (req,res,next) => {
    try {
        let { 
            page = 1, 
            limit = 10, 
            status, 
            category, 
            brand,
            type, 
            minPrice, 
            maxPrice,
            inStock,
            search 
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const query = {};

        // Filter by status
        if (status !== undefined) {
            query.status = status === 'true' || status === 'active' ? 'active' : 'inactive';
        }

        // Filter by category
        if (category !== undefined) {
            if (isValidObjectId(category)) {
                query.category = category;
            }
        }

        // Filter by brand
        if (brand !== undefined) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        // Filter by type
        if (type !== undefined) {
            if (['regular', 'discount', 'premium'].includes(type)) {
                query.type = type;
            }
        }

        // Filter by price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) {
                query.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice !== undefined) {
                query.price.$lte = parseFloat(maxPrice);
            }
        }

        // Filter by stock availability
        if (inStock !== undefined) {
            if (inStock === 'true' || inStock === true) {
                query.stock = { $gt: 0 };
            }
        }

        // Search by name, description, or brand
        let searchQuery = query;
        if (search) {
            searchQuery = {
                ...query,
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const products = await Product.find(searchQuery)
            .populate('category', 'name slug')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select('-__v');

        const totalProducts = await Product.countDocuments(searchQuery);

        return successRespons(res, 200, {
            products,
            pagination: {
                page,
                limit,
                total: totalProducts,
                pages: Math.ceil(totalProducts / limit),
            },
        });

    } catch (err) {
        next(err);
    };
};

exports.getOneProduct = async (req,res,next) => {
    try {
        const { productId } = req.params;

        // Validate productId
        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'Invalid product ID');
        }

        // Find product by ID and populate category and userReviews
        const product = await Product.findById(productId)
            .populate('category', 'name slug')
            .populate('userReviews.user', 'name email')
            .select('-__v');

        // Check if product exists
        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        return successRespons(res, 200, {
            product,
        });

    } catch (err) {
        next(err);
    };
};

exports.updateProduct = async (req,res,next) => {
    try {
        const { productId } = req.params;
        const { 
            name, 
            slug, 
            description, 
            positiveFeature, 
            category, 
            brand,
            badge, 
            status, 
            price, 
            stock, 
            originalPrice, 
            discount, 
            type, 
            dealType, 
            timeLeft, 
            soldCount, 
            totalCount, 
            rating, 
            weight,
            ingredients,
            benefits,
            howToUse,
            hasWarranty,
            warrantyDuration,
            warrantyDescription,
            userReviews,
            isPrime, 
            isPremium, 
            features, 
            image, 
            seo 
        } = req.body;

        // Validate productId
        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'Invalid product ID');
        }

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        // Parse features if provided as string
        if (req.body.features && typeof req.body.features === 'string') {
            req.body.features = req.body.features
              .replace(/["']/g, '')
              .split(',')
              .map(f => f.trim())
              .filter(f => f);
        }

        // Validate request body
        await updateProductValidator.validate(req.body, { abortEarly: false });

        // Check if slug already exists (if slug is being updated)
        if (slug && slug !== product.slug) {
            const existingProduct = await Product.findOne({ slug });
            if (existingProduct) {
                return errorResponse(res, 409, 'Product with this slug already exists');
            }
        }

        // Validate category if provided
        if (category !== undefined) {
            if (!isValidObjectId(category)) {
                return errorResponse(res, 400, 'Invalid category ID');
            }
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return errorResponse(res, 404, 'Category not found');
            }
        }

        // Handle image uploads
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Validate file format
                if (!supportedFormat.includes(file.mimetype)) {
                    return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
                }
                imagePaths.push(file.path.replace(/\\/g, '/'));
            }
        }

        // Build update object (only update provided fields)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (slug !== undefined) updateData.slug = slug;
        if (description !== undefined) updateData.description = description;
        if (positiveFeature !== undefined) updateData.positiveFeature = positiveFeature;
        if (category !== undefined) updateData.category = category;
        if (brand !== undefined) updateData.brand = brand;
        if (badge !== undefined) updateData.badge = badge;
        if (status !== undefined) updateData.status = status;
        if (price !== undefined) updateData.price = price;
        if (stock !== undefined) updateData.stock = stock;
        if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
        if (discount !== undefined) updateData.discount = discount;
        if (type !== undefined) updateData.type = type;
        if (dealType !== undefined) updateData.dealType = dealType;
        if (timeLeft !== undefined) updateData.timeLeft = timeLeft;
        if (soldCount !== undefined) updateData.soldCount = soldCount;
        if (totalCount !== undefined) updateData.totalCount = totalCount;
        if (rating !== undefined) updateData.rating = rating;
        if (weight !== undefined) updateData.weight = weight;
        if (ingredients !== undefined) updateData.ingredients = ingredients;
        if (benefits !== undefined) updateData.benefits = benefits;
        if (howToUse !== undefined) updateData.howToUse = howToUse;
        if (hasWarranty !== undefined) updateData.hasWarranty = hasWarranty;
        if (warrantyDuration !== undefined) updateData.warrantyDuration = warrantyDuration;
        if (warrantyDescription !== undefined) updateData.warrantyDescription = warrantyDescription;
        if (userReviews !== undefined) updateData.userReviews = userReviews;
        if (isPrime !== undefined) updateData.isPrime = isPrime;
        if (isPremium !== undefined) updateData.isPremium = isPremium;
        if (features !== undefined) updateData.features = features;
        if (seo !== undefined) updateData.seo = seo;

        // Handle images
        if (imagePaths.length > 0) {
            // If new images uploaded, add them to existing images or replace
            updateData.images = [...(product.images || []), ...imagePaths];
            // Set main image to first uploaded image
            updateData.image = imagePaths[0];
        } else if (image !== undefined) {
            // If image URL provided, set it as main image
            updateData.image = image;
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('category', 'name slug')
        .populate('userReviews.user', 'name email')
        .select('-__v');

        return successRespons(res, 200, {
            product: updatedProduct,
            message: 'Product updated successfully'
        });

    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError' && err.inner) {
            const validationErrors = err.inner.map(e => ({
                path: e.path,
                message: e.message
            }));
            return errorResponse(res, 400, 'Validation failed', validationErrors);
        }
        next(err);
    };
};

exports.deleteProduct = async (req,res,next) => {
    try {
        const { productId } = req.params;

        // Validate productId
        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'Invalid product ID');
        }

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        // Delete product
        await Product.findByIdAndDelete(productId);

        return successRespons(res, 200, {
            message: 'Product deleted successfully'
        });

    } catch (err) {
        next(err);
    };
};