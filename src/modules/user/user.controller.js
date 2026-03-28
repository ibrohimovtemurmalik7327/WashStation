const sendResponse = require('../../helpers/sendResponse');
const UserService = require('./user.service');

class UserController {
    createUser = async (req, res) => {
        const result = await UserService.createUser(req.body);
        return sendResponse(res, result, 201);
    };

    getUsers = async (req, res) => {
        const result = await UserService.getUsers();
        return sendResponse(res, result);
    };

    getUser = async (req, res) => {
        const result = await UserService.getUser(req.params.id);
        return sendResponse(res, result);
    };

    updateUser = async (req, res) => {
        const result = await UserService.updateUser(req.params.id, req.body);
        return sendResponse(res, result);
    };

    changePassword = async (req, res) => {
        const result = await UserService.changePassword(req.params.id, req.body);
        return sendResponse(res, result);
    };

    deactivateUser = async (req, res) => {
        const result = await UserService.deactivateUser(req.params.id);
        return sendResponse(res, result);
    };
}

module.exports = new UserController();