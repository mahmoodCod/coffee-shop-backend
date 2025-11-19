const { successRespons, errorResponse } = require("../../helpers/responses");
const Article = require("../../model/Article");
const Category = require("../../model/Category");
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
    } catch (err) {
        next (err);
    };
};

exports.createArticle = async (req,res,next) => {
    try {
        const user = req.user;
        const { title, excerpt, discription, body, href, category, badge, readTime, author, date, publish } = req.body;

        // Validate request body
        await createArticleValidator.validate(req.body, { abortEarly: false });

        // Validate category ID
        if (!isValidObjectId(category)) {
            return errorResponse(res, 400, `Invalid category ID: ${category}`);
        }

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return errorResponse(res, 404, `Category not found: ${category}`);
        }

        // Handle cover image upload
        let coverPath = '';
        if (req.file) {
            // Validate file format (optional - you can add more validation)
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, WEBP, GIF');
            }
            coverPath = req.file.path.replace(/\\/g, '/');
        } else {
            return errorResponse(res, 400, 'Cover image is required');
        }

        // Check if href (link) already exists
        const existingArticle = await Article.findOne({ href });
        if (existingArticle) {
            return errorResponse(res, 400, `Article with link "${href}" already exists`);
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
        });

        // Populate category and creator
        await newArticle.populate('category', 'name slug');
        await newArticle.populate('creator', 'name email');

        return successRespons(res, 201, {
            message: 'Article created successfully :))',
            article: newArticle
        });

    } catch (err) {
        next (err);
    };
};

exports.getOne = async (req,res,next) => {
    try {
        const { href } = req.params;

        // Find article by href with populate
        const article = await Article.findOne({ href })
            .populate('category', 'name slug')
            .populate('creator', 'name email');

        // Check if article exists
        if (!article) {
            return errorResponse(res, 404, 'Article not found');
        }

        // Check if article is published (publish === 1)
        if (article.publish !== 1) {
            return errorResponse(res, 404, 'Article not found');
        }

        return successRespons(res, 200, {
            article,
        });

    } catch (err) {
        next (err);
    };
};

exports.deleteArticle = async (req,res,next) => {
    try {
        const { id } = req.params;

        // Validate article ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid article ID');
        }

        // Find and delete article
        const deletedArticle = await Article.findByIdAndDelete(id);

        // Check if article exists
        if (!deletedArticle) {
            return errorResponse(res, 404, 'Article not found');
        }

        return successRespons(res, 200, {
            message: 'Article deleted successfully :))',
            article: deletedArticle
        });

    } catch (err) {
        next (err);
    };
};

exports.updateArticle = async (req,res,next) => {
    try {
        const { id } = req.params;
        const { title, excerpt, discription, body, href, category, badge, readTime, author, date, publish } = req.body;

        // Validate article ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid article ID');
        }

        // Find article
        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return errorResponse(res, 404, 'Article not found');
        }

        // Validate request body
        await updateArticleValidator.validate(req.body, { abortEarly: false });

        // Build update object (only update provided fields)
        const updateData = {};

        // Handle category if provided
        if (category !== undefined) {
            if (!isValidObjectId(category)) {
                return errorResponse(res, 400, `Invalid category ID: ${category}`);
            }
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return errorResponse(res, 404, `Category not found: ${category}`);
            }
            updateData.category = category;
        }

        // Handle cover image upload if file exists
        if (req.file) {
            // Validate file format
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
            }
            updateData.cover = req.file.path.replace(/\\/g, '/');
        }

        // Handle href if provided (check for duplicate)
        if (href !== undefined && href !== existingArticle.href) {
            const duplicateArticle = await Article.findOne({ href });
            if (duplicateArticle) {
                return errorResponse(res, 400, `Article with link "${href}" already exists`);
            }
            updateData.href = href;
        }

        // Add other fields if provided
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
            message: 'Article updated successfully :))',
            article: updatedArticle
        });

    } catch (err) {
        next (err);
    };
};

exports.saveDraft = async (req,res,next) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { title, excerpt, discription, body, href, category, badge, readTime, author, date } = req.body;

        // Validate article ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid article ID');
        }

        // Find article
        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return errorResponse(res, 404, 'Article not found');
        }

        // Validate request body (use updateArticleValidator since all fields are optional)
        await updateArticleValidator.validate(req.body, { abortEarly: false });

        // Build update object (only update provided fields)
        const updateData = {};

        // Handle category if provided
        if (category !== undefined) {
            if (!isValidObjectId(category)) {
                return errorResponse(res, 400, `Invalid category ID: ${category}`);
            }
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return errorResponse(res, 404, `Category not found: ${category}`);
            }
            updateData.category = category;
        }

        // Handle cover image upload if file exists
        if (req.file) {
            // Validate file format
            if (!supportedFormat.includes(req.file.mimetype)) {
                return errorResponse(res, 400, 'Unsupported file format. Supported formats: JPEG, PNG, SVG, WEBP, GIF');
            }
            updateData.cover = req.file.path.replace(/\\/g, '/');
        }

        // Handle href if provided (check for duplicate, but only if different from current)
        if (href !== undefined && href !== existingArticle.href) {
            const duplicateArticle = await Article.findOne({ href });
            if (duplicateArticle && duplicateArticle._id.toString() !== id) {
                return errorResponse(res, 400, `Article with link "${href}" already exists`);
            }
            updateData.href = href;
        }

        // Add other fields if provided
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (discription !== undefined) updateData.discription = discription;
        if (body !== undefined) updateData.body = body;
        if (badge !== undefined) updateData.badge = badge;
        if (readTime !== undefined) updateData.readTime = readTime;
        if (author !== undefined) updateData.author = author;
        if (date !== undefined) updateData.date = new Date(date);

        // Always set publish to 0 (draft) when saving as draft
        updateData.publish = 0;

        // Update article
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('category', 'name slug')
        .populate('creator', 'name email');

        return successRespons(res, 200, {
            message: 'Draft saved successfully :))',
            article: updatedArticle
        });

    } catch (err) {
        next (err);
    };
};