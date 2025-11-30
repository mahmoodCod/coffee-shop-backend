const { errorResponse } = require("../helpers/responses");

module.exports = (role) => {
    return async(req,res,next) => {
        try {
            if(!req.user.roles.includes(role)) {
                return errorResponse(res,401, 'شما به این مسیر دسترسی ندارید!!');
            };
            next()
        } catch (err) {
            next(err);
        };
    };
};