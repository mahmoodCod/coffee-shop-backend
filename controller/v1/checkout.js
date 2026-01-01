const { createPayment, verifyPayment } = require('../../services/zarinpal');
const { createCheckoutValidator } = require('../../validator/checkout');
const { errorResponse, successRespons } = require('../../helpers/responses');
const Cart = require('../../model/Cart');
const Checkout = require('../../model/Checkout');
const Order = require('../../model/Order');
const Product = require('../../model/Product');

exports.createCheckout = async (req,res,next) => {
    try {
        const user = req.user;

        await createCheckoutValidator.validate(req.body, { abortEarly: false });

        const cart = await Cart.findOne({ user: user._id }).populate('items.product');

        if (!cart?.items?.length) {
            return errorResponse(res, 400, 'سبد خرید خالی است یا یافت نشد');
        }

        const { shippingAddressId } = req.body;
        const shippingAddress = user.addresses.find(addr => addr._id.toString() === shippingAddressId);
        if (!shippingAddress) {
            return errorResponse(res, 400, 'آدرس ارسال نامعتبر است');
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
            return errorResponse(res, 500, 'ایجاد پرداخت با مشکل مواجه شد');
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
            message: 'فرآیند تسویه حساب با موفقیت ایجاد شد',
            checkout: newCheckout,
            paymentUrl: payment.paymentUrl,
        });

    } catch (err) {
        next(err);
    }
};

exports.verifyCheckout = async (req,res,next) => {
    try {
        const { Authority: authority } = req.query;

        const alreadyCreateOrder = await Order.findOne({ authority });
        if (alreadyCreateOrder) {
            return errorResponse(res, 400, 'پرداخت قبلاً تأیید شده است');
        }

        const checkout = await Checkout.findOne({ authority });
        if (!checkout) {
            return errorResponse(res, 404, 'فرآیند تسویه حساب یافت نشد');
        }

        const payment = await verifyPayment({
            authority,
            amountInRial: checkout.totalPrice,
        });

        if (![100, 101].includes(payment.data.code)) {
            return errorResponse(res, 400, 'پرداخت تأیید نشد');
        }

        const order = new Order({
            user: checkout.user,
            authority: checkout.authority,
            items: checkout.items,
            shippingAddress: checkout.shippingAddress
        });

        await order.save();

        for (const item of checkout.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        await Cart.findOneAndUpdate({ user: checkout.user }, { items: [] });
        await checkout.deleteOne();

        return successRespons(res, 200, {
            message: "پرداخت با موفقیت تأیید شد",
            order,
        });
    } catch (err) {
        next(err);
    }
};
