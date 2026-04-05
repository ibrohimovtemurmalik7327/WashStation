const AuthService = require('./auth.service');
const sendResponse = require('../../helpers/sendResponse');

class AuthController {
    registerStart = async (req, res) => {
        const result = await AuthService.registerStart(req.body);
        return sendResponse(res, result, 201);
    };

    registerVerify = async (req, res) => {
        const result = await AuthService.registerVerify(req.body);
        return sendResponse(res, result, 201);
    };

    login = async (req, res) => {
        const result = await AuthService.login(req.body);
        return sendResponse(res, result);
    };

    changePassword = async (req, res) => {
        const result = await AuthService.changePassword(req.user.id, req.body);
        return sendResponse(res, result);
    };

    forgotPasswordStart = async (req, res) => {
        const result = await AuthService.forgotPasswordStart(req.body);
        return sendResponse(res, result);
    };

    forgotPasswordVerify = async (req, res) => {
        const result = await AuthService.forgotPasswordVerify(req.body);
        return sendResponse(res, result);
    };
}

module.exports = new AuthController();