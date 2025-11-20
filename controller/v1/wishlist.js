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
        const user = req.user._id;

        const list = await Wishlist.find({ user }).populate("product");
    
        return successRespons(res, 200, list);

    } catch (err) {
        next(err);
    };
};

exports.removeFromWishlist = async (req,res,next) => {
    try {
        const user = req.user._id;
    const { id } = req.params;

    const removed = await Wishlist.findOneAndDelete({ user, product: id });

    if (!removed) return errorResponse(res, 404, "Item not found");

    return successRespons(res, 200, {
      message: "Removed from wishlist"
    });

    } catch (err) {
        next(err);
    };
};