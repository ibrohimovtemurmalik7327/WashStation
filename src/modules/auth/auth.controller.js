const AuthService = require('./auth.service');
const { sendResponse } = require('../../helpers/response.helper');

class AuthController {

    registerStart = async (req, res) => {
        const result = await AuthService.registerStart(req.body);
        return sendResponse(res, result, 201);
    };

    registerVerify = async (req, res) => {
        const result = await AuthService.registerVerify(req.body);
        return sendResponse(res, result);
    };

    loginStart = async (req, res) => {
        const result = await AuthService.loginStart(req.body);
        return sendResponse(res, result);
    };

    loginVerify = async (req, res) => {
        const result = await AuthService.loginVerify(req.body);
        return sendResponse(res, result);
    };

    resetPasswordStart = async (req, res) => {
        const result = await AuthService.resetPasswordStart(req.body);
        return sendResponse(res, result);
    };

    resetPasswordVerify = async (req, res) => {
        const result = await AuthService.resetPasswordVerify(req.body);
        return sendResponse(res, result);
    };

    resendOtp = async (req, res) => {
        const result = await AuthService.resendOtp(req.body);
        return sendResponse(res, result);
    };
}

module.exports = new AuthController();