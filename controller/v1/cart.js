const { errorResponse, successRespons } = require('../../helpers/responses');
const { addToCartValidator, removeFromCartValidator } = require('../../validator/cart');
const Product = require('../../model/Product');
const Cart = require('../../model/Cart');
const { isValidObjectId } = require('mongoose');

exports.getCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            return successRespons(res, 200, {
                message: "سبد خرید خالی است",
                cart: {
                    items: [],
                    totalPrice: 0
                }
            });
        }

        return successRespons(res, 200, {
            message: "سبد خرید با موفقیت بازیابی شد",
            cart: {
                items: cart.items,
                totalPrice: cart.totalPrice
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.addCart = async (req, res, next) => {
    try {
        await addToCartValidator.validate(req.body, { abortEarly: false });

        const user = req.user;
        const { productId, quantity } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'شناسه محصول معتبر نیست');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, 404, 'محصول پیدا نشد');
        }

        const productDetails = product;

        if (!productDetails) {
            return errorResponse(res, 400, 'این محصول قابل فروش نیست');
        }

        const cart = await Cart.findOne({ user: user._id });
        const priceAtTimeOfAdding = productDetails.price;

        if (!cart) {
            const newCart = await Cart.create({
                user: user._id,
                items: [
                    {
                        product: productId,
                        quantity,
                        priceAtTimeOfAdding
                    },
                ],
            });

            return successRespons(res, 200, {
                cart: newCart
            });
        }

        const existingItem = cart.items.find((item) => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                priceAtTimeOfAdding,
            });
        }

        await cart.save();

        return successRespons(res, 200, { cart });
    } catch (err) {
        next(err);
    }
};

exports.removeCart = async (req, res, next) => {
    try {
        await removeFromCartValidator.validate(req.body, { abortEarly: false });

        const userId = req.user._id;
        const { productId } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'شناسه محصول معتبر نیست');
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return errorResponse(res, 404, 'سبد خرید پیدا نشد');
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return errorResponse(res, 404, 'محصول در سبد خرید یافت نشد');
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();

        return successRespons(res, 200, {
            message: 'محصول با موفقیت از سبد خرید حذف شد',
            cart,
            totalPrice: cart.totalPrice
        });

    } catch (err) {
        next(err);
    }
};

exports.updateCart = async (req, res, next) => {
    try {
        await addToCartValidator.validate(req.body, { abortEarly: false });

        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'شناسه محصول معتبر نیست');
        }

        if (quantity < 1) {
            return errorResponse(res, 400, 'تعداد محصول باید حداقل ۱ باشد');
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return errorResponse(res, 404, 'سبد خرید پیدا نشد');
        }

        const item = cart.items.find(item => item.product.toString() === productId);

        if (!item) {
            return errorResponse(res, 404, 'محصول در سبد خرید یافت نشد');
        }

        item.quantity = quantity;

        await cart.save();

        return successRespons(res, 200, {
            message: 'سبد خرید با موفقیت به‌روزرسانی شد',
            cart,
            totalPrice: cart.totalPrice
        });

    } catch (err) {
        next(err);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return successRespons(res, 200, {
                message: 'سبد خرید پیش‌تر خالی است',
                cart: {
                    items: [],
                    totalPrice: 0
                }
            });
        }

        cart.items = [];

        await cart.save();

        return successRespons(res, 200, {
            message: 'سبد خرید با موفقیت خالی شد',
            cart: {
                items: [],
                totalPrice: 0
            }
        });

    } catch (err) {
        next(err);
    }
};
