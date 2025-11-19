
exports.getAllOrders = async (req,res,next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = req.user;

        const filters = {
            ...(user.roles.includes("ADMOIN") ? {} : { user: user._id }),
        };

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
