const { errorResponse, successRespons } = require('../../helpers/responses');
const {addToCartValidator, removeFromCartValidator} = require('../../validator/cart');
const Product = require('../../model/Product');
const Cart = require('../../model/Cart');

exports.getCart = async (req,res,next) => {
    try {
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            return successRespons(res, 200,{
                message: "Cart is empty",
                cart: {
                    items: [],
                    totalPrice: 0
                }
            });
        }

        return successRespons(res,200,{
            message: "Cart retrieved successfully",
            cart: {
                items: cart.items,
                totalPrice: cart.totalPrice
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.addCart = async (req,res,next) => {
    try {
        await addToCartValidator.validate(req.body, { abortEarly: false });
        
        const user = req.user;
        const { productId, quantity } = req.body;

        if (!isValidObjectId(productId)){
            return errorResponse(res,400, 'Product is not valid !!');
        };

        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res,404, 'Product not found !!');
        };

        const productDetails = product;

        if (!productDetails) {
            return errorResponse(res,400, 'Product does not sell !!');
        };

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

            return successRespons(res,200, {
                cart: newCart
            });
        };

        const existingItem = cart.items.find((item) => {
            return item.product.toString() === productId ;
        });

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                priceAtTimeOfAdding,
            });
        };

        await cart.save();

        return successRespons(res,200, { cart });
    } catch (err) {
        next(err);
    };
};

exports.removeCart = async (req,res,next) => {
    try {
        await removeFromCartValidator.validate(req.body, { abortEarly: false });

        const userId = req.user._id;
        const { productId } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'Product ID is not valid');
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return errorResponse(res, 404, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return errorResponse(res, 404, 'Product not found in cart');
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();

        return successRespons(res, 200, {
            message: 'Product removed from cart successfully',
            cart,
            totalPrice: cart.totalPrice
        });

    } catch (err) {
        next(err);
    }
};

exports.updateCart = async (req,res,next) => {
    try {
        await addToCartValidator.validate(req.body, { abortEarly: false });

        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, 'Product ID is not valid');
        }

        if (quantity < 1) {
            return errorResponse(res, 400, 'Quantity must be at least 1');
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return errorResponse(res, 404, 'Cart not found');
        }

        const item = cart.items.find(item => item.product.toString() === productId);

        if (!item) {
            return errorResponse(res, 404, 'Product not found in cart');
        }

        item.quantity = quantity;

        await cart.save();

        return successRespons(res, 200, {
            message: 'Cart updated successfully',
            cart,
            totalPrice: cart.totalPrice
        });

    } catch (err) {
        next(err);
    }
};

exports.clearCart = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};