const bcrypt = require('bcrypt');
const config = require('../../config/config');
const BCRYPT_COST = Number(config.bcrypt.cost || 10);
const UserModels = require('./user.models');

class UserService {
    createUser = async (data) => {
        try {
            const doesExist = await UserModels.getByPhone(data.phone);
            if(doesExist) {
                return {
                    success: false,
                    code: 'CONFLICT',
                    message: 'This phone number already used',
                };
            };

            const user = {
                phone: data.phone,
            };

            user.password_hash = await bcrypt.hash(data.password, BCRYPT_COST);

            await UserModels.createUser(user);

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            };
        }
    };

    getUser = async (id) => {
        try {
            const user = await UserModels.getUserById(id);
            if(!user) {
                return {
                    success: false,
                    code: 'NOT_FOUND',
                    message: 'User not found',
                };
            };

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            };
        }
    };

    getUsers = async () => {
        try {
            const users = await UserModels.getUsers();
            
            return {
                success: true, 
                data: users
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            };
        }
    };

    updateUser = async (id, data) => {
        try {
            const doesExist = await UserModels.getUserById(id);
            if(!doesExist) {
                return {
                    success: false,
                    code: 'NOT_FOUND',
                    message: 'User not found',
                };
            };

            const updatedUser = await UserModels.updateById(id, {phone: data.phone});
            return {
                success: true, 
                data: updatedUser
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            };
        }
    };

    deleteUser = async (id) => {
        try {
            const user = await UserModels.getUserById(id);
            if(!user) {
                return {
                    success: false,
                    code: 'NOT_FOUND',
                    message: 'User not found',
                };
            };

            await UserModels.deleteById(id);

            return {
                success: true,
                data: {}
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            };
        }
    };

    changePassword = async (id, data) => {
        try {
            const {old_password, new_password} = data;
            const old_password_hash = await UserModels.getPasswordHashById(id);

            if(!old_password_hash) {
                return {
                    success: false,
                    code: 'NOT_FOUND',
                    message: 'User not found',
                };
            };

            const isMatch = await bcrypt.compare(old_password, old_password_hash);

            if(!isMatch) {
                return {
                    success: false,
                    code: 'INCORRECT_OLD_PASSWORD',
                    message: 'Old password incorrect',
                };
            };

            const hashed_new_password = await bcrypt.hash(new_password, BCRYPT_COST);

            const result = await UserModels.changePassword(id, hashed_new_password);

            return {
                success: true, 
                data: result
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            };
        }
    };
}

module.exports = new UserService();