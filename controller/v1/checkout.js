const { createPayment } = require('../../services/zarinpal');
const { createCheckoutValidator } = require('../../validator/checkout');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Cart = require('../../model/Cart');
const Checkout = require('../../model/Checkout');

exports.createCheckout = async (req,res,next) => {
    try {
        const user = req.user;

        await createCheckoutValidator.validate(req.body, { abortEarly: false });

        const cart = await Cart.findOne({ user: user._id }).populate('items.product');

        if (!cart?.items?.length) {
            return errorResponse(res, 400, 'Cart is empty or not found!');
        }

        const { shippingAddressId } = req.body;
        const shippingAddress = user.addresses.find(addr => addr._id.toString() === shippingAddressId);
        if (!shippingAddress) {
            return errorResponse(res, 400, 'Shipping address is invalid!');
        }

        const checkoutItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtTimeOfPurchase: item.product.price,
        }));

        const totalPrice = checkoutItems.reduce((total, item) => total + item.priceAtTimeOfPurchase * item.quantity, 0);

        const payment = await createPayment({
            amountInRial: totalPrice,
            description: `سفارش با شناسه ${user._id}`,
            mobile: user.phone,
        });

        if (!payment || !payment.authority) {
            return errorResponse(res, 500, 'Failed to create payment.');
        }

        const newCheckout = new Checkout({
            user: user._id,
            items: checkoutItems,
            shippingAddress,
            authority: payment.authority,
            totalPriceAfterDiscount: totalPrice,
        });

        await newCheckout.save();

        return successRespons(res, 201, {
            message: 'Checkout created successfully!',
            checkout: newCheckout,
            paymentUrl: payment.paymentUrl,
        });

    } catch (err) {
        next(err);
    }
};

exports.verifyCheckout = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};