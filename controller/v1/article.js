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