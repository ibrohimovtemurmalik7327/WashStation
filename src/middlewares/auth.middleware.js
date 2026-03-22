const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authRequired = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                data: {}
            });
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                data: {}
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);

        req.user = decoded;

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED',
            data: {}
        });
    }
};

const roleRequired = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                data: {}
            });
        }

        const role = req.user.role;

        if (!role) {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                data: {}
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                data: {}
            });
        }

        return next();
    };
};

const selfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED',
            data: {}
        });
    }

    const authUserId = Number(req.user.sub);
    const targetUserId = Number(req.params.id);
    const role = req.user.role;

    if (role === 'admin' || authUserId === targetUserId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        data: {}
    });
};

module.exports = {
    authRequired,
    roleRequired,
    selfOrAdmin
};