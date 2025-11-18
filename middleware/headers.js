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
    };

    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "600");

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    next();
};