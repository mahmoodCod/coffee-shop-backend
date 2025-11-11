const errorResponse = (res, statusCode, message, data ) => {
    return res.status(statusCode).json({ status: statusCode, success: false, error: message,data });
};