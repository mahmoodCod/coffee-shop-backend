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

// Helper to safely parse array from form-data
function parseArrayField(field) {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
        return JSON.parse(field);
    } catch {
        return [field]; // fallback: treat single value as array
    }
}

// ---------------- GET ALL ARTICLES ----------------
exports.getAllArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, publish, search } = req.query;

        const filters = {};
        if (publish !== undefined) {
            const publishNum = parseInt(publish);
            if (!isNaN(publishNum) && [0, 1].includes(publishNum)) filters.publish = publishNum;
        } else filters.publish = 1;

        if (category && isValidObjectId(category)) filters.category = category;

        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { discription: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const articles = await Article.find(filters)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        const totalArticles = await Article.countDocuments(filters);

        return successRespons(res, 200, {
            articles,
            pagination: createPaginationData(pageNum, limitNum, totalArticles, "Articles"),
        });

    } catch (err) {
        next(err);
    }
};

// ---------------- CREATE ARTICLE ----------------
exports.createArticle = async (req, res, next) => {
    try {
        const user = req.user;
        const {
            title, excerpt, discription, body, href,
            category, badge, readTime, author, date,
            publish, relatedProducts
        } = req.body;

        await createArticleValidator.validate(req.body, { abortEarly: false });

        if (!isValidObjectId(category)) return errorResponse(res, 400, `شناسه دسته نامعتبر است: ${category}`);

        const categoryExists = await Category.findById(category);
        if (!categoryExists) return errorResponse(res, 404, `دسته پیدا نشد: ${category}`);

        if (!req.file) return errorResponse(res, 400, 'تصویر جلد الزامی است');
        if (!supportedFormat.includes(req.file.mimetype)) {
            return errorResponse(res, 400, 'فرمت فایل پشتیبانی نشده. فرمت های مجاز: JPEG، PNG، WEBP، GIF');
        }

        const existingArticle = await Article.findOne({ href });
        if (existingArticle) return errorResponse(res, 400, `مقاله با لینک "${href}" در حال حاضر وجود دارد`);

        // Parse relatedProducts safely
        const relatedProductsArray = parseArrayField(relatedProducts);

        const newArticle = await Article.create({
            title,
            excerpt,
            discription,
            body,
            cover: req.file.path.replace(/\\/g, '/'),
            href,
            category,
            creator: user._id,
            badge: badge || '',
            readTime: readTime || '',
            author,
            date: date ? new Date(date) : new Date(),
            publish,
            relatedProducts: relatedProductsArray
        });

        await newArticle.populate('category', 'name slug');
        await newArticle.populate('creator', 'name email');

        return successRespons(res, 201, {
            message: 'مقاله با موفقیت ایجاد شد',
            article: newArticle
        });

    } catch (err) {
<<<<<<< HEAD
=======
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
>>>>>>> fde885e046fe3a0f48bb183cb8bb8c6efe1a1b41
        next(err);
    }
};

// ---------------- GET ONE ARTICLE ----------------
exports.getOne = async (req, res, next) => {
    try {
        const { href } = req.params;

        const article = await Article.findOne({ href })
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        if (!article || article.publish !== 1) {
            return errorResponse(res, 404, 'مقاله موردنظر یافت نشد');
        }

        let relatedProducts = [];
        if (article.relatedProducts?.length) {
            relatedProducts = await Product.find({
                _id: { $in: article.relatedProducts }
            }).select("name slug price image stock");
        }

        return successRespons(res, 200, { article, relatedProducts });

    } catch (err) {
        next(err);
    }
};

// ---------------- DELETE ARTICLE ----------------
exports.deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه مقاله نامعتبر است');

        const deletedArticle = await Article.findByIdAndDelete(id);
        if (!deletedArticle) return errorResponse(res, 404, 'مقاله یافت نشد');

        return successRespons(res, 200, { message: 'مقاله با موفقیت حذف شد', article: deletedArticle });

    } catch (err) {
        next(err);
    }
};

// ---------------- UPDATE ARTICLE ----------------
exports.updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            title, excerpt, discription, body, href,
            category, badge, readTime, author, date,
            publish, relatedProducts
        } = req.body;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه مقاله معتبر نیست');

        const existingArticle = await Article.findById(id);
        if (!existingArticle) return errorResponse(res, 404, 'مقاله پیدا نشد');

        await updateArticleValidator.validate(req.body, { abortEarly: false });

        const updateData = {};

        if (category !== undefined) {
            if (!isValidObjectId(category)) return errorResponse(res, 400, `شناسه دسته‌بندی معتبر نیست: ${category}`);
            const categoryExists = await Category.findById(category);
            if (!categoryExists) return errorResponse(res, 404, `دسته‌بندی پیدا نشد: ${category}`);
            updateData.category = category;
        }

        if (req.file) {
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'فرمت فایل پشتیبانی نمی‌شود');
            }
            updateData.cover = req.file.path.replace(/\\/g, '/');
        }

        if (href !== undefined && href !== existingArticle.href) {
            const duplicateArticle = await Article.findOne({ href });
            if (duplicateArticle) return errorResponse(res, 400, `مقاله‌ای با لینک "${href}" از قبل وجود دارد`);
            updateData.href = href;
        }

        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (discription !== undefined) updateData.discription = discription;
        if (body !== undefined) updateData.body = body;
        if (badge !== undefined) updateData.badge = badge;
        if (readTime !== undefined) updateData.readTime = readTime;
        if (author !== undefined) updateData.author = author;
        if (date !== undefined) updateData.date = new Date(date);
        if (publish !== undefined) updateData.publish = publish;

        // Parse relatedProducts safely
        updateData.relatedProducts = parseArrayField(relatedProducts);

        const updatedArticle = await Article.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        return successRespons(res, 200, { message: 'مقاله با موفقیت به‌روزرسانی شد', article: updatedArticle });

    } catch (err) {
        next(err);
    }
};

// ---------------- SAVE DRAFT ----------------
exports.saveDraft = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            title, excerpt, discription, body, href,
            category, badge, readTime, author, date,
            relatedProducts
        } = req.body;

        if (!isValidObjectId(id)) return errorResponse(res, 400, 'شناسه مقاله معتبر نیست');

        const existingArticle = await Article.findById(id);
        if (!existingArticle) return errorResponse(res, 404, 'مقاله پیدا نشد');

        await updateArticleValidator.validate(req.body, { abortEarly: false });

        const updateData = { publish: 0 }; // always draft

        if (category !== undefined) {
            if (!isValidObjectId(category)) return errorResponse(res, 400, `شناسه دسته‌بندی معتبر نیست: ${category}`);
            const categoryExists = await Category.findById(category);
            if (!categoryExists) return errorResponse(res, 404, `دسته‌بندی پیدا نشد: ${category}`);
            updateData.category = category;
        }

        if (req.file) {
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'فرمت فایل پشتیبانی نمی‌شود');
            }
            updateData.cover = req.file.path.replace(/\\/g, '/');
        }

        if (href !== undefined && href !== existingArticle.href) {
            const duplicateArticle = await Article.findOne({ href });
            if (duplicateArticle && duplicateArticle._id.toString() !== id) {
                return errorResponse(res, 400, `مقاله‌ای با لینک "${href}" از قبل وجود دارد`);
            }
            updateData.href = href;
        }

        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (discription !== undefined) updateData.discription = discription;
        if (body !== undefined) updateData.body = body;
        if (badge !== undefined) updateData.badge = badge;
        if (readTime !== undefined) updateData.readTime = readTime;
        if (author !== undefined) updateData.author = author;
        if (date !== undefined) updateData.date = new Date(date);

        // Parse relatedProducts safely
        updateData.relatedProducts = parseArrayField(relatedProducts);

        const updatedArticle = await Article.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        return successRespons(res, 200, { message: 'پیش‌نویس با موفقیت ذخیره شد', article: updatedArticle });

    } catch (err) {
        next(err);
    }
};
