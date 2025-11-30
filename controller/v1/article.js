const { successRespons, errorResponse } = require("../../helpers/responses");
const Article = require("../../model/Article");
const Category = require("../../model/Category");
const Product = require('../../model/Product');
const { createArticleValidator, updateArticleValidator } = require('../../validator/article');
const { isValidObjectId } = require('mongoose');
const { createPaginationData } = require('../../utils');

const supportedFormat = [
    "image/jpeg",
    "image/svg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
];

exports.getAllArticles = async (req,res,next) => {
    try {
        const { page = 1, limit = 10, category, publish, search } = req.query;

        // Build filters
        const filters = {};

        // Filter by publish status (default: only published articles - publish === 1)
        if (publish !== undefined) {
            const publishNum = parseInt(publish);
            if (!isNaN(publishNum) && [0, 1].includes(publishNum)) {
                filters.publish = publishNum;
            }
        } else {
            // Default: only show published articles
            filters.publish = 1;
        }

        // Filter by category
        if (category) {
            if (isValidObjectId(category)) {
                filters.category = category;
            }
        }

        
        // Search by title, excerpt, or description
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { discription: { $regex: search, $options: 'i' } }
            ];
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find articles with filters, pagination, and populate
        const articles = await Article.find(filters)
            .sort({ createdAt: "desc" })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        // Count total articles with filters
        const totalArticles = await Article.countDocuments(filters);

        return successRespons(res, 200, {
            articles,
            pagination: createPaginationData(pageNum, limitNum, totalArticles, "Articles"),
        });

    } catch (err) {
        next (err);
    };
};

exports.createArticle = async (req,res,next) => {
    try {
        const user = req.user;
        const { title, excerpt, discription, body, href, category, badge, readTime, author, date, publish, productTags } = req.body;

        // Validate request body
        await createArticleValidator.validate(req.body, { abortEarly: false });

        // Validate category ID
        if (!isValidObjectId(category)) {
            return errorResponse(res, 400, `شناسه دسته نامعتبر است: ${category}`);
        }

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return errorResponse(res, 404, `دسته پیدا نشد: ${category}`);
        }

        // Handle cover image upload
        let coverPath = '';
        if (req.file) {
            // Validate file format (optional - you can add more validation)
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'فرمت فایل پشتیبانی نشده فرمت های پشتیبانی شده: JPEG، PNG، WEBP، GIF');
            }
            coverPath = req.file.path.replace(/\\/g, '/');
        } else {
            return errorResponse(res, 400, 'تصویر جلد الزامی است');
        }

        // Check if href (link) already exists
        const existingArticle = await Article.findOne({ href });
        if (existingArticle) {
            return errorResponse(res, 400, `مقاله با لینک "${href}" در حال حاضر وجود دارد`);
        }

        // Create article
        const newArticle = await Article.create({
            title,
            excerpt,
            discription,
            body,
            cover: coverPath,
            href,
            category,
            creator: user._id,
            badge: badge || '',
            readTime: readTime || '',
            author,
            date: date ? new Date(date) : new Date(),
            publish,
            productTags: productTags || []
        });

        // Populate category and creator
        await newArticle.populate('category', 'name slug');
        await newArticle.populate('creator', 'name email');

        return successRespons(res, 201, {
            message: 'مقاله با موفقیت ایجاد شد :))',
            article: newArticle
        });

    } catch (err) {
        next (err);
    };
};

exports.getOne = async (req,res,next) => {
    try {
        const { href } = req.params;

        // Find article by href
        const article = await Article.findOne({ href })
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        // Check if article exists and is published
        if (!article || article.publish !== 1) {
            return errorResponse(res, 404, 'مقاله موردنظر یافت نشد');
        }

        // Load related products if any
        let relatedProducts = [];
        if (article.relatedProducts?.length) {
            relatedProducts = await Product.find({
                _id: { $in: article.relatedProducts }
            }).select("name slug price image stock");
        }
       // Load related products if any
       let relatedProducts = [];
       if (article.relatedProducts?.length) {
           relatedProducts = await Product.find({
               _id: { $in: article.relatedProducts }
           }).select("name slug price image stock");
       }

        return successRespons(res, 200, {
            article,
            relatedProducts
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteArticle = async (req,res,next) => {
    try {
        const { id } = req.params;

        // Validate article ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه مقاله نامعتبر است');
        }

        // Find and delete article
        const deletedArticle = await Article.findByIdAndDelete(id);

        // Check if article exists
        if (!deletedArticle) {
            return errorResponse(res, 404, 'مقاله یافت نشد');
        }

        return successRespons(res, 200, {
            message: 'مقاله با موفقیت حذف شد :))',
            article: deletedArticle
        });

    } catch (err) {
        next (err);
    };
};

exports.updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, excerpt, discription, body, href, category, badge, readTime, author, date, publish } = req.body;

        // Validate article ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه مقاله معتبر نیست');
        }

        // Find article
        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return errorResponse(res, 404, 'مقاله پیدا نشد');
        }

        // Validate request body
        await updateArticleValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        // Handle category
        if (category !== undefined) {
            if (!isValidObjectId(category)) {
                return errorResponse(res, 400, `شناسه دسته‌بندی معتبر نیست: ${category}`);
            }
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return errorResponse(res, 404, `دسته‌بندی پیدا نشد: ${category}`);
            }
            updateData.category = category;
        }

        // Handle cover upload
        if (req.file) {
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPEG، PNG، SVG، WEBP، GIF');
            }
            updateData.cover = req.file.path.replace(/\\/g, '/');
        }

        // Handle href
        if (href !== undefined && href !== existingArticle.href) {
            const duplicateArticle = await Article.findOne({ href });
            if (duplicateArticle) {
                return errorResponse(res, 400, `مقاله‌ای با لینک "${href}" از قبل وجود دارد`);
            }
            updateData.href = href;
        }

        // Add optional fields
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (discription !== undefined) updateData.discription = discription;
        if (body !== undefined) updateData.body = body;
        if (badge !== undefined) updateData.badge = badge;
        if (readTime !== undefined) updateData.readTime = readTime;
        if (author !== undefined) updateData.author = author;
        if (date !== undefined) updateData.date = new Date(date);
        if (publish !== undefined) updateData.publish = publish;

        // Update article
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('category', 'name slug')
        .populate('creator', 'name email');

        return successRespons(res, 200, {
            message: 'مقاله با موفقیت به‌روزرسانی شد',
            article: updatedArticle
        });

    } catch (err) {
        next(err);
    }
};


exports.saveDraft = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, excerpt, discription, body, href, category, badge, readTime, author, date } = req.body;

        // Validate article ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه مقاله معتبر نیست');
        }

        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return errorResponse(res, 404, 'مقاله پیدا نشد');
        }

        await updateArticleValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        // Category
        if (category !== undefined) {
            if (!isValidObjectId(category)) {
                return errorResponse(res, 400, `شناسه دسته‌بندی معتبر نیست: ${category}`);
            }
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return errorResponse(res, 404, `دسته‌بندی پیدا نشد: ${category}`);
            }
            updateData.category = category;
        }

        // Cover
        if (req.file) {
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPEG، PNG، SVG، WEBP، GIF');
            }
            updateData.cover = req.file.path.replace(/\\/g, '/');
        }

        // href duplicate check
        if (href !== undefined && href !== existingArticle.href) {
            const duplicateArticle = await Article.findOne({ href });
            if (duplicateArticle && duplicateArticle._id.toString() !== id) {
                return errorResponse(res, 400, `مقاله‌ای با لینک "${href}" از قبل وجود دارد`);
            }
            updateData.href = href;
        }

        // Fields
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (discription !== undefined) updateData.discription = discription;
        if (body !== undefined) updateData.body = body;
        if (badge !== undefined) updateData.badge = badge;
        if (readTime !== undefined) updateData.readTime = readTime;
        if (author !== undefined) updateData.author = author;
        if (date !== undefined) updateData.date = new Date(date);

        // Saving draft → always publish = 0
        updateData.publish = 0;

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('category', 'name slug')
        .populate('creator', 'name email');

        return successRespons(res, 200, {
            message: 'پیش‌نویس با موفقیت ذخیره شد',
            article: updatedArticle
        });

    } catch (err) {
        next(err);
    }
};
