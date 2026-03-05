const UserService = require('./user.service');

const ERROR_STATUS = {
  VALIDATION_ERROR: 400,
  INCORRECT_OLD_PASSWORD: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  EXPIRED: 410,
  TOO_MANY_ATTEMPTS: 429,
  INTERNAL_ERROR: 500
};

class UserController {

    createUser = async(req, res) => {

        const result = await UserService.createUser(req.body);

        if(!result?.success) {
            const status = ERROR_STATUS[result?.code] || 500;

            return res.status(status).json({
                message: result?.message
            });
        };

        return res.status(201).json(result);
    };

    getUser = async(req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.getUser(id);

        if(!result?.success) {
            const status = ERROR_STATUS[result?.code] || 500;

            return res.status(status).json({
                message: result?.message
            });
        };

        return res.status(200).json(result);
    };

    getUsers = async(req, res) => {
        const result = await UserService.getUsers();

        if(!result?.success) {
            const status = ERROR_STATUS[result?.code] || 500;

            return res.status(status).json({
                message: result?.message
            });
        };
        
        return res.status(200).json(result);
    };

    updateUser = async(req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.updateUser(id, req.body);

        if(!result?.success) {
            const status = ERROR_STATUS[result?.code] || 500;

            return res.status(status).json({
                message: result?.message
            });
        };

        res.status(200).json(result);
    };

    deleteUser = async(req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.deleteUser(id);

        if(!result?.success) {
            const status = ERROR_STATUS[result?.code] || 500;

            return res.status(status).json({
                message: result?.message
            });
        };

        return res.sendStatus(204);
    };

    changePassword = async(req, res) => {
        const id = Number(req.params.id);
        const result = await UserService.changePassword(id, req.body);

        if(!result?.success) {
            const status = ERROR_STATUS[result?.code] || 500;

            return res.status(status).json({
                message: result?.message
            });
        };
        
        return res.status(200).json(result);
    };

};

module.exports = new UserController();