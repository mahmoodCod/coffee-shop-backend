const { successRespons, errorResponse } = require("../../helpers/responses");
const Article = require("../../model/Article");
const Category = require("../../model/Category");
const { createArticleValidator } = require('../../validator/article');
const { isValidObjectId } = require('mongoose');

exports.getAllArticles = async (req,res,next) => {
    try {

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
            const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!supportedFormats.includes(req.file.mimetype)) {
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

    } catch (err) {
        next (err);
    };
};

exports.deleteArticle = async (req,res,next) => {
    try {

    } catch (err) {
        next (err);
    };
};

exports.updateArticle = async (req,res,next) => {
    try {

    } catch (err) {
        next (err);
    };
};

exports.saveDraft = async (req,res,next) => {
    try {

    } catch (err) {
        next (err);
    };
};