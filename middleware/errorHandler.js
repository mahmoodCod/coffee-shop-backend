const { errorResponse } = require('../helpers/responses');

module.exports = (err, req, res, next) => {
  // Handle Yup validation errors
  if (err && err.name === 'ValidationError') {
    const details = Array.isArray(err.inner) && err.inner.length
      ? err.inner.map(e => ({ path: e.path, message: e.message }))
      : undefined;
    return errorResponse(res, 400, 'اعتبارسنجی ناموفق بود', details);
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'خطای سرور داخلی';
  return errorResponse(res, status, message);
};
