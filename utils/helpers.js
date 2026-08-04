function sanitizeString(str, defaultValue = '') {
    if (typeof str !== 'string') return defaultValue;
    return str.trim();
}

function parseIntSafe(value, defaultValue = null) {
    if (value === null || value === undefined || value === '') return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

function parseFloatSafe(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function handleErrorResponse(res, req, message, activePage = '', statusCode = 400) {
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);
    if (isAjax) {
        return res.status(statusCode).json({ success: false, message });
    }
    return res.status(statusCode).render('pages/error', {
        title: 'Aviso do Sistema',
        message,
        activePage
    });
}

function handleSuccessResponse(res, req, message, redirectUrl, extraData = {}) {
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);
    if (isAjax) {
        return res.json({ success: true, message, ...extraData });
    }
    return res.redirect(redirectUrl);
}

module.exports = {
    sanitizeString,
    parseIntSafe,
    parseFloatSafe,
    handleErrorResponse,
    handleSuccessResponse
};
