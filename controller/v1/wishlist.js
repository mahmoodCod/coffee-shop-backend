const { successRespons, errorResponse } = require("../../helpers/responses");
const { addToWishlistValidator } = require('../../validator/wishlist');
const Wishlist = require("../../model/Wishlist");
const Product = require('../../model/Product');

exports.addToWishlist = async (req,res,next) => {
    try {
        const user = req.user._id;

        await addToWishlistValidator.validate(req.body, { abortEarly: false });

        const { product } = req.body;

        const exists = await Product.findById(product);
            if (!exists) return errorResponse(res, 404, "Product not found");

        const favorite = await Wishlist.create({
            user,
            product
        });

        return successRespons(res, 201, {
            message: "Added to wishlist",
            favorite
        });

    } catch (err) {
        next(err);
    };
};

exports.getWishlist = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.removeFromWishlist = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};