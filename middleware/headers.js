exports.setHeaders = (req,res,next) => {
    const requestOrigin = req.headers.origin;
    const allowed = process.env.CORS_ALLOWED_ORIGINS || '*';
    let allowOrigin = '*';

    if (allowed !== '*') {
        const allowedList = allowed.split(',').map(o => o.trim()).filter(Boolean);
        if (requestOrigin && allowedList.includes(requestOrigin)) {
            allowOrigin = requestOrigin;
        } else {
            allowOrigin = allowedList[0] || '*';
        }
    }
};