const { successRespons, errorResponse } = require("../../helpers/responses");
const Order = require("../../model/Order");
const Product = require("../../model/Product");
const { createPaginationData } = require("../../utils");
const { createOrderValidator, updateOrderValidator } = require('../../validator/order');
const { isValidObjectId } = require('mongoose');

exports.createOrder = async (req,res,next) => {
    try {
        const user = req.user;
        const { items, shippingAddress, authority } = req.body;

        await createOrderValidator.validate(req.body, { abortEarly: false });

        const orderItems = [];
        for (const item of items) {
            if (!isValidObjectId(item.product)) {
                return errorResponse(res, 400, `شناسه محصول نامعتبر است: ${item.product}`);
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return errorResponse(res, 404, `محصول یافت نشد: ${item.product}`);
            }

            if (product.stock < item.quantity) {
                return errorResponse(res, 400, `موجودی محصول کافی نیست: ${product.name}. موجود: ${product.stock}, درخواستی: ${item.quantity}`);
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtTimeOfAdding: product.price,
            });
        }

        const newOrder = await Order.create({
            user: user._id,
            items: orderItems,
            shippingAddress,
            authority,
            status: "PROCESSING",
        });

        return successRespons(res, 201, {
            message: 'سفارش با موفقیت ایجاد شد',
            order: newOrder
        });

    } catch (err) {
        next (err);
    };
};

exports.getOrderById = async (req,res,next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه سفارش نامعتبر است');
        }

        const order = await Order.findById(id)
            .populate('user', '-addresses')
            .populate('items.product');

        if (!order) {
            return errorResponse(res, 404, 'سفارش یافت نشد');
        }

        if (!user.roles.includes("ADMIN") && order.user._id.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'شما به این سفارش دسترسی ندارید');
        }

        return successRespons(res, 200, { order });

    } catch (err) {
        next (err);
    };
};

exports.getAllOrders = async (req,res,next) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;
        const filters = {};

        if (status && ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
            filters.status = status;
        }

        if (userId && isValidObjectId(userId)) {
            filters.user = userId;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const orders = await Order.find(filters)
            .sort({ createdAt: "desc" })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate({ path: 'user', select: '-addresses' })
            .populate({ path: 'items.product', options: { strictPopulate: false } });

        const ordersData = orders.map(order => {
            try {
                const orderObj = order.toObject({ virtuals: true });
                if (orderObj.items && Array.isArray(orderObj.items)) {
                    orderObj.items = orderObj.items.filter(item => item.product !== null && item.product !== undefined);
                }
                if (!orderObj.user) orderObj.user = null;
                return orderObj;
            } catch (err) {
                console.error('خطا در تبدیل سفارش به شیء:', err);
                return {
                    _id: order._id,
                    status: order.status,
                    createdAt: order.createdAt,
                    items: []
                };
            }
        });

        const totalOrders = await Order.countDocuments(filters);

        return successRespons(res, 200, {
            orders: ordersData,
            pagination: createPaginationData(pageNum, limitNum, totalOrders, "سفارش‌ها"),
        });

    } catch (err) {
        next (err);
    };
};

exports.getMyOrders = async (req,res,next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const orders = await Order.find()
            .sort({ createdAt: "desc" })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('user', '-addresses')
            .populate('items.product');

        const totalOrders = await Order.countDocuments();

        return successRespons(res, 200, {
            orders,
            pagination: createPaginationData(pageNum, limitNum, totalOrders, "سفارش‌ها"),
        });

    } catch (err) {
        next (err);
    };
};

exports.updateOrder = async (req,res,next) => {
    try {
        const { id } = req.params;
        const { postTrackingCode, status } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'شناسه سفارش نامعتبر است');
        }

        await updateOrderValidator.validate(req.body, { abortEarly: false });

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (postTrackingCode !== undefined) updateData.postTrackingCode = postTrackingCode;

        const order = await Order.findByIdAndUpdate(id, updateData, { new: true })
            .populate('user', '-addresses')
            .populate('items.product');

        if (!order) {
            return errorResponse(res, 404, 'سفارش یافت نشد');
        }

        return successRespons(res, 200, { 
            order,
            message: 'سفارش با موفقیت بروزرسانی شد'
        });

    } catch (err) {
        next (err);
    };
};
