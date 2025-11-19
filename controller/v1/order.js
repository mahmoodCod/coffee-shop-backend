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

        // Validate request body
        await createOrderValidator.validate(req.body, { abortEarly: false });

        // Validate and check products
        const orderItems = [];
        for (const item of items) {
            if (!isValidObjectId(item.product)) {
                return errorResponse(res, 400, `Invalid product ID: ${item.product}`);
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return errorResponse(res, 404, `Product not found: ${item.product}`);
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                return errorResponse(res, 400, `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }

            // Add item with price at time of adding
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtTimeOfAdding: product.price,
            });
        }

        // Create order
        const newOrder = await Order.create({
            user: user._id,
            items: orderItems,
            shippingAddress,
            authority,
            status: "PROCESSING",
        });

        return successRespons(res, 201, {
            message: 'Order created successfully :))',
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

        // Validate order ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid order ID');
        }

        // Find order by ID with populate
        const order = await Order.findById(id)
            .populate('user', '-addresses')
            .populate('items.product');

        // Check if order exists
        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        // Check if user has access (only owner or ADMIN)
        if (!user.roles.includes("ADMIN") && order.user._id.toString() !== user._id.toString()) {
            return errorResponse(res, 403, 'You do not have access to this order');
        }

        return successRespons(res, 200, {
            order,
        });

    } catch (err) {
        next (err);
    };
};

exports.getAllOrders = async (req,res,next) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;
        // const user = req.user;

        // Build filters
        const filters = {};

        // Filter by status
        if (status) {
            if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
                filters.status = status;
            }
        }

        // Filter by user ID
        if (userId) {
            if (isValidObjectId(userId)) {
                filters.user = userId;
            }
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find orders with filters, pagination, and populate
        const orders = await Order.find(filters)
            .sort({ createdAt: "desc" })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('user', '-addresses')
            .populate('items.product');

        // Count total orders with filters
        const totalOrders = await Order.countDocuments(filters);

        return successRespons(res, 200, {
            orders,
            pagination: createPaginationData(pageNum, limitNum, totalOrders, "Orders"),
        });

    } catch (err) {
        next (err);
    };
};

exports.getMyOrders = async (req,res,next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = req.user;

        // Filter by current user only (even for ADMIN)
        const filters = {
            user: user._id
        };

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find orders with pagination and populate
        const orders = await Order.find(filters)
            .sort({ createdAt: "desc" })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('user', '-addresses')
            .populate('items.product');

        // Count total orders
        const totalOrders = await Order.countDocuments(filters);

        return successRespons(res, 200, {
            orders,
            pagination: createPaginationData(pageNum, limitNum, totalOrders, "Orders"),
        });

    } catch (err) {
        next (err);
    };
};

exports.updateOrder = async (req,res,next) => {
    try {
        const { id } = req.params;
        const { postTrackingCode, status } = req.body;

        // Validate order ID
        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, 'Invalid order ID');
        }

        // Validate request body
        await updateOrderValidator.validate(req.body, { abortEarly: false });

        // Build update object with only provided fields
        const updateData = {};
        if (status !== undefined) {
            updateData.status = status;
        }
        if (postTrackingCode !== undefined) {
            updateData.postTrackingCode = postTrackingCode;
        }

        // Update order
        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
        .populate('user', '-addresses')
        .populate('items.product');

        // Check if order exists
        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        return successRespons(res, 200, { 
            order,
            message: 'Order updated successfully :))'
        });

    } catch (err) {
        next (err);
    };
};
