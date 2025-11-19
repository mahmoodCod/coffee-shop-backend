const { successRespons } = require("../../helpers/responses");
const Order = require("../../model/Order");
const { createPaginationData } = require("../../utils");

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

    } catch (err) {
        next (err);
    };
};
