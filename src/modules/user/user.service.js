const bcrypt = require('bcrypt');
const config = require('../../config/config');
const UserModels = require('./user.models');

const BCRYPT_COST = Number(config.bcrypt?.cost || 10);

class UserService {
    createUser = async (data) => {
        try {
            const { username, phone, password } = data;

            const existingUsername = await UserModels.getByUsername(username);
            if (existingUsername) {
                return {
                    success: false,
                    error: 'USERNAME_CONFLICT',
                    data: {}
                };
            }

            const existingPhone = await UserModels.getByPhone(phone);
            if (existingPhone) {
                return {
                    success: false,
                    error: 'PHONE_CONFLICT',
                    data: {}
                };
            }

            const password_hash = await bcrypt.hash(password, BCRYPT_COST);

            const user = await UserModels.createUser({
                username,
                phone,
                password_hash,
                role: 'user'
            });

            if (!user) {
                return {
                    success: false,
                    error: 'INTERNAL_ERROR',
                    data: {}
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error('UserService.createUser error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                        data: {}
                    };
                }

                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }

                return {
                    success: false,
                    error: 'CONFLICT',
                    data: {}
                };
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR',
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
            console.error('UserService.getUsers error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: []
            };
        }
    };

    getUser = async (id) => {
        try {
            const user = await UserModels.getUserById(id);
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error('UserService.getUser error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    updateUser = async (id, data) => {
        try {
            const user = await UserModels.getUserById(id);
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            if (data.username) {
                const existingUsername = await UserModels.getByUsername(data.username);
                if (existingUsername && existingUsername.id !== id) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                        data: {}
                    };
                }
            }

            if (data.phone) {
                const existingPhone = await UserModels.getByPhone(data.phone);
                if (existingPhone && existingPhone.id !== id) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }
            }

            const result = await UserModels.updateUser(id, data);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('UserService.updateUser error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                        data: {}
                    };
                }
                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }

                return {
                    success: false,
                    error: 'CONFLICT',
                    data: {}
                };
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    changePassword = async (id, data) => {
        try {
            const { old_password, new_password } = data;

            const user = await UserModels.getByIdWithPassword(id);
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            const isMatch = await bcrypt.compare(old_password, user.password_hash);
            if (!isMatch) {
                return {
                    success: false,
                    error: 'INCORRECT_PASSWORD',
                    data: {}
                };
            }

            const hashedNewPassword = await bcrypt.hash(new_password, BCRYPT_COST);

            const result = await UserModels.updatePassword(id, hashedNewPassword);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('UserService.changePassword error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    deactivateUser = async (id) => {
        try {
            const user = await UserModels.getUserById(id);
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            const result = await UserModels.deactivateUser(id);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('UserService.deactivateUser error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

}

module.exports = new UserService();