const { errorResponse, successRespons } = require('../../helpers/responses');
const Comment = require('../../model/Comment');
const Product = require('../../model/Product');
const { createCommentValidator } = require('../../validator/comment');

exports.createComment = async (req,res,next) => {
    try {
        const user = req.user;
        const { content, rating, productId } = req.body;

        await createCommentValidator.validate({
            content,
            productId,
            rating,
        }, { abortEarly: false});
        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return errorResponse(res,404, 'Product not found !!');
        };

        const newComment = await Comment.create({
            product: product._id,
            user: user._id,
            content,
            rating,
            replies: [],
        });

        return successRespons(res,201, {
            message: 'Comment created successfully :))',
            comment: newComment
        });

    } catch (err) {
        next(err);
    };
};

exports.getComment = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.getAllComments = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.removeComment = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.updateComment = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.createReply = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.updateReply = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.removeReply = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};
