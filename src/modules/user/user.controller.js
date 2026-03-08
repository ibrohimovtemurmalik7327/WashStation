const UserService = require('./user.service');
const { sendResponse } = require('../../helpers/response.helper');

class UserController {
    createUser = async (req, res) => {
        const result = await UserService.createUser(req.body);
        return sendResponse(res, result, 201);
    };

    getUser = async (req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.getUser(id);
        return sendResponse(res, result, 200);
    };

    getUsers = async (req, res) => {
        const result = await UserService.getUsers();
        return sendResponse(res, result, 200);
    };

    updateUser = async (req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.updateUser(id, req.body);
        return sendResponse(res, result, 200);
    };

    deleteUser = async (req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.deleteUser(id);
        return sendResponse(res, result, 204);
    };

    changePassword = async (req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.changePassword(id, req.body);
        return sendResponse(res, result, 200);
    };

    getMe = async (req, res) => {
        const id = Number(req.user?.sub);
        const result = await UserService.getUser(id);
        return sendResponse(res, result);
    }

}

module.exports = new UserController();