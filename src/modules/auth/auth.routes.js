const express = require('express');
const router = express.Router();

const AuthController = require('./auth.controller');
const { validate } = require('../../middlewares/validate');
const {
    registerStartSchema,
    registerVerifySchema,
    loginStartSchema,
    loginVerifySchema,
    resetPasswordStartSchema,
    resetPasswordVerifySchema,
    resendOtpSchema
} = require('./auth.val');

router.post('/register/start', validate(registerStartSchema), AuthController.registerStart);
router.post('/register/verify', validate(registerVerifySchema), AuthController.registerVerify);

router.post('/login/start', validate(loginStartSchema), AuthController.loginStart);
router.post('/login/verify', validate(loginVerifySchema), AuthController.loginVerify);

router.post('/reset-password/start', validate(resetPasswordStartSchema), AuthController.resetPasswordStart);
router.post('/reset-password/verify', validate(resetPasswordVerifySchema), AuthController.resetPasswordVerify);

router.post('/otp/resend', validate(resendOtpSchema), AuthController.resendOtp);

module.exports = router;