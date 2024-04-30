const protocolChecker = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }

    if (process.env.NODE_ENV === 'development') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-CSRF-Protection', '1');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://apis.google.com");
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
};

export default protocolChecker;
