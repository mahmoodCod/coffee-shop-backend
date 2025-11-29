const { successRespons, errorResponse } = require("../../helpers/responses");
const { addWishlistValidator } = require('../../validator/wishlist');
const Wishlist = require("../../model/Wishlist");
const Product = require('../../model/Product');

exports.addToWishlist = async (req, res, next) => {
    try {
        const user = req.user._id;

        await addWishlistValidator.validate(req.body, { abortEarly: false });

        const { product } = req.body;

        const productExists = await Product.findById(product);
        if (!productExists) return errorResponse(res, 404, "محصول یافت نشد");

        const favorite = await Wishlist.create({ user, product });

        return successRespons(res, 201, {
            message: "محصول با موفقیت به علاقه‌مندی‌ها اضافه شد",
            favorite
        });

    } catch (err) {
        next(err);
    }
};

exports.getWishlist = async (req, res, next) => {
    try {
        const user = req.user._id;

        const list = await Wishlist.find({ user }).populate("product");

        return successRespons(res, 200, {
            wishlist: list
        });

    } catch (err) {
        next(err);
    }
};

exports.removeFromWishlist = async (req, res, next) => {
    try {
        const user = req.user._id;
        const { id } = req.params;

        const removed = await Wishlist.findOneAndDelete({ user, product: id });

        if (!removed) return errorResponse(res, 404, "آیتم مورد نظر یافت نشد");

        return successRespons(res, 200, {
            message: "آیتم با موفقیت از علاقه‌مندی‌ها حذف شد"
        });

    } catch (err) {
        next(err);
    }
};
