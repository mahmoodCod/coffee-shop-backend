const { createProductValidator, updateProductValidator } = require('../../validator/product');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Product = require('../../model/Product');
const Category = require('../../model/Category');
const { isValidObjectId } = require('mongoose');
const { uploadToMinio, generateUniqueFileName } = require('../../utils/minioUpload');

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
        if (req.body.userReviews) {
            try {
                req.body.userReviews = JSON.parse(req.body.userReviews);
            } catch (err) {
                return errorResponse(res, 400, 'userReviews باید یک آرایه JSON معتبر باشد');
            }
        }

        if (req.body.relatedProducts) {
            if (typeof req.body.relatedProducts === 'string') {
              try {
                const clean = req.body.relatedProducts.replace(/^"|"$/g, '');
                req.body.relatedProducts = JSON.parse(clean);
              } catch (err) {
                return errorResponse(res, 400, 'relatedProducts باید یک آرایه JSON معتبر باشد');
              }
            }
            const invalidIds = req.body.relatedProducts.filter(id => !isValidObjectId(id));
            if (invalidIds.length > 0) {
              return errorResponse(res, 400, `شناسه(های) نامعتبر: ${invalidIds.join(', ')}`);
            }
        }

        if (req.body.features && typeof req.body.features === 'string') {
            req.body.features = req.body.features
              .replace(/["']/g, '')
              .split(',')
              .map(f => f.trim())
              .filter(f => f);
        }

        await createProductValidator.validate(req.body, { abortEarly: false });

        const existingProduct = await Product.findOne({ slug: req.body.slug });
        if (existingProduct) {
            return errorResponse(res, 409, 'محصولی با این slug از قبل وجود دارد');
        }

        if (!isValidObjectId(req.body.category)) {
            return errorResponse(res, 400, 'شناسه دسته‌بندی نامعتبر است');
        }
        const categoryExists = await Category.findById(req.body.category);
        if (!categoryExists) {
            return errorResponse(res, 404, 'دسته‌بندی یافت نشد');
        }

        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (!supportedFormat.includes(file.mimetype)) {
                    return errorResponse(res, 400, 'فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPEG, PNG, SVG, WEBP, GIF');
                }
                // آپلود به MinIO
                const uniqueFileName = generateUniqueFileName(file.originalname);
                const fileUrl = await uploadToMinio(file.buffer, uniqueFileName, 'products', file.mimetype);
                imagePaths.push(fileUrl);
            }
        }

        const mainImage = imagePaths.length > 0 ? imagePaths[0] : (req.body.image || '/images/default-product.jpg');

        const productData = {
            ...req.body,
            image: mainImage,
            images: imagePaths,
            features: req.body.features || [],
            description: req.body.description || '',
            badge: req.body.badge || '',
            status: req.body.status || 'inactive',
            originalPrice: req.body.originalPrice || 0,
            discount: req.body.discount || 0,
            type: req.body.type || 'regular',
            dealType: req.body.dealType || '',
            timeLeft: req.body.timeLeft || '',
            soldCount: req.body.soldCount || 0,
            totalCount: req.body.totalCount || 0,
            rating: req.body.rating || 0,
            weight: req.body.weight || 0,
            ingredients: req.body.ingredients || '',
            benefits: req.body.benefits || '',
            howToUse: req.body.howToUse || '',
            hasWarranty: req.body.hasWarranty || false,
            warrantyDuration: req.body.warrantyDuration || 0,
            warrantyDescription: req.body.warrantyDescription || '',
            // userReviews: req.body.userReviews || [],
            recommended: req.body.recommended || false,
            relatedProducts: req.body.relatedProducts || [],
            isPrime: req.body.isPrime || false,
            isPremium: req.body.isPremium || false,
        };

        if (req.body.seo) productData.seo = req.body.seo;

        const newProduct = await Product.create(productData);
        await newProduct.populate('category', 'name slug');

        return successRespons(res, 201, {
            product: newProduct,
            message: 'محصول با موفقیت ایجاد شد'
        });

    } catch (err) {
        if (err.name === 'ValidationError' && err.inner) {
            const validationErrors = err.inner.map(e => ({
                path: e.path,
                message: e.message
            }));
            return errorResponse(res, 400, 'اعتبارسنجی شکست خورد', validationErrors);
        }
        next(err);
    };
};

exports.getAllProduct = async (req,res,next) => {
    try {
        let { page = 1, limit = 10, status, category, brand, type, minPrice, maxPrice, inStock, search } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const query = {};

        if (status !== undefined) query.status = status === 'true' || status === 'active' ? 'active' : 'inactive';
        if (category !== undefined && isValidObjectId(category)) query.category = category;
        if (brand !== undefined) query.brand = { $regex: brand, $options: 'i' };
        if (type !== undefined && ['regular','discount','premium'].includes(type)) query.type = type;

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
        }

        if (inStock !== undefined && (inStock === 'true' || inStock === true)) {
            query.stock = { $gt: 0 };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .skip((page-1)*limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select('-__v');

        const totalProducts = await Product.countDocuments(query);

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
        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'شناسه محصول نامعتبر است');
        }

        const product = await Product.findById(productId)
            .populate('category', 'name slug')
            .populate('userReviews.user', 'name email')
            .select('-__v');

        if (!product) return errorResponse(res, 404, 'محصول یافت نشد');

        return successRespons(res, 200, { product });

    } catch (err) {
        next(err);
    };
};

exports.updateProduct = async (req,res,next) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) return errorResponse(res, 400, 'شناسه محصول نامعتبر است');

        const product = await Product.findById(productId);
        if (!product) return errorResponse(res, 404, 'محصول یافت نشد');

        if (req.body.features && typeof req.body.features === 'string') {
            req.body.features = req.body.features.replace(/["']/g,'').split(',').map(f=>f.trim()).filter(f=>f);
        }

        await updateProductValidator.validate(req.body, { abortEarly: false });

        if (req.body.slug && req.body.slug !== product.slug) {
            const existingProduct = await Product.findOne({ slug: req.body.slug });
            if (existingProduct) return errorResponse(res, 409, 'محصولی با این slug از قبل وجود دارد');
        }

        if (req.body.category !== undefined) {
            if (!isValidObjectId(req.body.category)) return errorResponse(res, 400, 'شناسه دسته‌بندی نامعتبر است');
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) return errorResponse(res, 404, 'دسته‌بندی یافت نشد');
        }

        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (!supportedFormat.includes(file.mimetype)) {
                    return errorResponse(res, 400, 'فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPEG, PNG, SVG, WEBP, GIF');
                }
                // آپلود به MinIO
                const uniqueFileName = generateUniqueFileName(file.originalname);
                const fileUrl = await uploadToMinio(file.buffer, uniqueFileName, 'products', file.mimetype);
                imagePaths.push(fileUrl);
            }
        }

        const updateData = { ...req.body };
        if (imagePaths.length > 0) {
            updateData.images = [...(product.images||[]), ...imagePaths];
            updateData.image = imagePaths[0];
        } else if (req.body.image !== undefined) {
            updateData.image = req.body.image;
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true })
            .populate('category', 'name slug')
            .populate('userReviews.user', 'name email')
            .select('-__v');

        return successRespons(res, 200, {
            product: updatedProduct,
            message: 'محصول با موفقیت بروزرسانی شد'
        });

    } catch (err) {
        if (err.name === 'ValidationError' && err.inner) {
            const validationErrors = err.inner.map(e => ({ path: e.path, message: e.message }));
            return errorResponse(res, 400, 'اعتبارسنجی شکست خورد', validationErrors);
        }
        next(err);
    };
};

exports.deleteProduct = async (req,res,next) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) return errorResponse(res, 400, 'شناسه محصول نامعتبر است');

        const product = await Product.findById(productId);
        if (!product) return errorResponse(res, 404, 'محصول یافت نشد');

        await Product.findByIdAndDelete(productId);

        return successRespons(res, 200, {
            message: 'محصول با موفقیت حذف شد'
        });

    } catch (err) {
        next(err);
    };
};
