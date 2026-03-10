const BranchModels = require('./branch.models');

class BranchService {
    createBranch = async (data) => {
        try {
            const doesExist = await BranchModels.getByPhone(data?.phone);
            if(doesExist) {
                return {
                    success: false,
                    error: 'PHONE_ALREADY_USED',
                    data: {}
                };
            };

            const result = await BranchModels.createBranch(data);
            return {
                success: true,
                data: result
            };
        } catch (error){
            console.error('createBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    getBranches = async () => {
        try {
            const result = await BranchModels.getBranches();
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error(error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    getBranch = async (id) => {
        try {
            const result = await BranchModels.getBranchById(id);
            if (!result) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            };

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('createBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    updateBranch = async (id, data) => {
        try {
            const { phone } = data;
            if (phone) {
                const existingPhone = await BranchModels.getByPhone(data?.phone);
                if(existingPhone && existingPhone?.id !== id) {
                    return {
                        success: false,
                        error: 'PHONE_ALREADY_USED',
                        data: {}
                    };
                };
            };

            const result = await BranchModels.updateBranch(id, data);
            if(!result) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            };

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('createBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    deactivateBranch = async (id) => {
        try {
            const doesExist = await BranchModels.getBranchById(id);
            if (!doesExist) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            };

            const result = await BranchModels.deactivateBranch(id);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('createBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    getActiveBranches = async () => {
        try {
            const result = await BranchModels.getActiveBranches();
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('createBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };
};

module.exports = new BranchService();