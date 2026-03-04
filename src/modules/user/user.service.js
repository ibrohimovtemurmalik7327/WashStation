const bcrypt = require('bcrypt');
const BCRYPT_COST = Number(process.env.BCRYPT_COST || 10);
const UserModels = require('./user.models');

class UserService {
    createUser = async (data) => {
        try {
            const doesExist = await UserModels.getByPhone(data.phone);
            if(doesExist) {
                return {
                    success: false,
                    error: 'This phone number already used',
                    data: {}
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
        } catch(error) {
            return {
                success: false,
                error: error,
                data: {}
            }
        }
    };

    getUserById = async (id) => {
        try {
            const user = await UserModels.getUserById(id);
            if(!user) {
                return {
                    success: false,
                    error: 'User not found',
                    data: {}
                };
            };

            return {
                success: true,
                data: user
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                data: {}
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
            return {
                success: false,
                error: error,
                data: {}
            };
        }
    };

    updateUser = async (id, data) => {
        try {
            const doesExist = await UserModels.getUserById(id);
            if(!doesExist) {
                return {
                    success: false,
                    error: 'User not found',
                    data: {}
                };
            };

            const updatedUser = await UserModels.updateById(id, {phone: data.phone});
            return {
                success: true, 
                data: updatedUser
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                data: {}
            };
        }
    };

    deleteUser = async (id) => {
        try {
            const user = await UserModels.getUserById(id);
            if(!user) {
                return {
                    success: false,
                    error: 'User not found',
                    data: {}
                };
            };

            const result = await UserModels.deleteById(id);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false, 
                error: error,
                data: {}
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
                    error: 'User not found',
                    data: {}
                };
            };

            const isMatch = await bcrypt.compare(old_password, old_password_hash);

            if(!isMatch) {
                return {
                    success: false,
                    error: 'Old password incorrect',
                    data: {}
                };
            };

            const hashed_new_password = await bcrypt.hash(new_password, BCRYPT_COST);

            const result = await UserModels.changePassword(id, hashed_new_password);

            return {
                success: true, 
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                data: {}
            };
        }
    };
}

module.exports = new UserService();