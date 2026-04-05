const jwt = require('jsonwebtoken');
const config = require('../config/config');
const UserModels = require('../modules/user/user.models');


const authRequired = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'TOKEN_MISSING',
                data: {}
            });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: 'TOKEN_INVALID',
                data: {}
            });
        }

        const token = parts[1];

        let payload;

        try {
            payload = jwt.verify(token, config.jwt.secret);
        } catch (error) {

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'TOKEN_EXPIRED',
                    data: {}
                });
            }

            return res.status(401).json({
                success: false,
                error: 'TOKEN_INVALID',
                data: {}
            });
        }

        const userId = payload?.sub;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'TOKEN_INVALID',
                data: {}
            });
        }

        const user = await UserModels.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                data: {}
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'USER_INACTIVE',
                data: {}
            });
        }

        req.user = {
            id: user.id,
            phone: user.phone,
            role: user.role
        };

        return next();

    } catch (error) {
        console.error('authRequired error:', error);

        return res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            data: {}
        });
    }
};

const roleRequired = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                data: {}
            });
        }

        const userRole = req.user.role;

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                data: {}
            });
        }

        return next();
    };
};



module.exports = {
    authRequired,
    roleRequired
};