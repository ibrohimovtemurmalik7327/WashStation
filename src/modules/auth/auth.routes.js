const express = require('express');
const router = express.Router();

const AuthController = require('./auth.controller');
const { validate } = require('../../middlewares/validate');
const { authRequired } = require('../../middlewares/auth.middleware');

const {
    registerStartSchema,
    registerVerifySchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordStartSchema,
    forgotPasswordVerifySchema
} = require('./auth.val');

router.post(
    '/register/start',
    validate(registerStartSchema),
    AuthController.registerStart
);

router.post(
    '/register/verify',
    validate(registerVerifySchema),
    AuthController.registerVerify
);

router.post(
    '/login',
    validate(loginSchema),
    AuthController.login
);

router.patch(
    '/change-password',
    authRequired,
    validate(changePasswordSchema),
    AuthController.changePassword
);

router.post(
    '/forgot-password/start',
    validate(forgotPasswordStartSchema),
    AuthController.forgotPasswordStart
);

router.post(
    '/forgot-password/verify',
    validate(forgotPasswordVerifySchema),
    AuthController.forgotPasswordVerify
);

module.exports = router;