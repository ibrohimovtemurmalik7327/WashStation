const bcrypt = require('bcrypt');
const config = require('../../config/config');

const UserModels = require('./user.models');

const BCRYPT_COST = Number(config.bcrypt.cost || 10);

class UserService {

    createUser = async (data) => {
        try {
            const existing = await UserModels.getByPhone(data.phone);

            if (existing) {
                return {
                    success: false,
                    error: 'PHONE_ALREADY_USED',
                    data: {}
                };
            }

            const password_hash = await bcrypt.hash(data.password, BCRYPT_COST);

            const user = await UserModels.createUser({
                phone: data.phone,
                password_hash
            });

            return {
                success: true,
                data: user
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL',
                data: {}
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
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL',
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
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL',
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

            // faqat phone kelgan bo‘lsa tekshir
            if (data.phone) {
                const existing = await UserModels.getByPhone(data.phone);

                if (existing && existing.id !== id) {
                    return {
                        success: false,
                        error: 'PHONE_ALREADY_USED',
                        data: {}
                    };
                }
            }

            const updated = await UserModels.updateById(id, {
                phone: data.phone
            });

            return {
                success: true,
                data: updated
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL',
                data: {}
            };
        }
    };

    deleteUser = async (id) => {
        try {
            const user = await UserModels.getUserById(id);

            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            await UserModels.deleteById(id);

            return {
                success: true,
                data: {}
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL',
                data: {}
            };
        }
    };

    changePassword = async (id, data) => {
        try {
            const { old_password, new_password } = data;

            const old_hash = await UserModels.getPasswordHashById(id);

            if (!old_hash) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            const isMatch = await bcrypt.compare(old_password, old_hash);

            if (!isMatch) {
                return {
                    success: false,
                    error: 'INCORRECT_OLD_PASSWORD',
                    data: {}
                };
            }

            const new_hash = await bcrypt.hash(new_password, BCRYPT_COST);

            const result = await UserModels.changePassword(id, new_hash);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL',
                data: {}
            };
        }
    };
}

module.exports = new UserService();