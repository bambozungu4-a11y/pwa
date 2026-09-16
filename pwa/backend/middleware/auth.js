/**
 * Authentication Middleware
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT Token
 */
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

/**
 * Check user role/type
 */
function checkRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        next();
    };
}

/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error(err);
    
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
}

/**
 * Request validation middleware
 */
function validateRequest(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(d => ({
                    field: d.path.join('.'),
                    message: d.message
                }))
            });
        }
        
        req.validatedData = value;
        next();
    };
}

/**
 * Rate limiting middleware
 */
function rateLimit(maxRequests = 100, windowMs = 60 * 1000) {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        
        if (!requests.has(ip)) {
            requests.set(ip, []);
        }
        
        const ips = requests.get(ip).filter(time => now - time < windowMs);
        ips.push(now);
        requests.set(ip, ips);
        
        if (ips.length > maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }
        
        next();
    };
}

/**
 * Logging middleware
 */
function logger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
}

module.exports = {
    verifyToken,
    checkRole,
    errorHandler,
    validateRequest,
    rateLimit,
    logger
};
