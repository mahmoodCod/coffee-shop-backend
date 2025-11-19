const { successRespons } = require("../../helpers/responses");
const Order = require("../../model/Order");
const { createPaginationData } = require("../../utils");
const { updateOrderValidator } = require('../../validator/order');

exports.getAllOrders = async (req,res,next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = req.user;

        const filters = {
            ...(user.roles.includes("ADMIN") ? {} : { user: user._id }),
        };

        const orders = await Order.find(filters).sort({ createAt: "desc" }).skip(( page - 1 ) * limit).limit(limit).populate('user').populate('items.product');

        const totalOrders = await Order.countDocuments(filters);

        return successRespons(res,200, {
            orders,
            pagination: createPaginationData( page, limit, totalOrders, "Orders"),
        });

    } catch (err) {
        next (err);
    };
};

exports.updateOrder = async (req,res,next) => {
    try {
        const { postTrackingCode, status } = req.body;
        const { id } = req.params;

        await updateOrderValidator.validate(req.body, { abortEarly: false });

        const order =  await Order.findByIdAndUpdate({
            postTrackingCode,
            status
        },{ new: true });

        return successRespons(res,200, { 
            order,
            message: 'Order updated successfully :))'
        });

    } catch (err) {
        next (err);
    };
};
