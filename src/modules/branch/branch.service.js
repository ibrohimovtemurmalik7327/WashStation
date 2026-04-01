const BranchModels = require('./branch.models');

class BranchService {
    createBranch = async (data) => {
        try {
            const { phone } = data;

            const existingPhone = await BranchModels.getByPhone(phone);
            if (existingPhone) {
                return {
                    success: false,
                    error: 'PHONE_CONFLICT',
                    data: {}
                };
            }

            const result = await BranchModels.createBranch(data);

            if (!result) {
                return {
                    success: false,
                    error: 'INTERNAL_ERROR',
                    data: {}
                };
            }

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('BranchService.createBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    getBranches = async () => {
        try {
            const branches = await BranchModels.getBranches();

            return {
                success: true,
                data: branches
            };
        } catch (error) {
            console.error('BranchService.getBranches error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: []
            };
        }
    };

    getBranch = async (id) => {
        try {
            const branchId = Number(id);

            const branch = await BranchModels.getBranchById(branchId);
            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND',
                    data: {}
                };
            }

            return {
                success: true,
                data: branch
            };
        } catch (error) {
            console.error('BranchService.getBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    getActiveBranches = async () => {
        try {
            const activeBranches = await BranchModels.getActiveBranches();

            return {
                success: true,
                data: activeBranches
            };
        } catch (error) {
            console.error('BranchService.getActiveBranches error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: []
            };
        }
    };

    updateBranch = async (id, data) => {
        try {
            const branchId = Number(id);

            const branch = await BranchModels.getBranchById(branchId);

            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND',
                    data: {}
                };
            }

            if (data.phone) {
                const existingPhone = await BranchModels.getByPhone(data.phone);

                if (existingPhone && existingPhone.id !== branchId) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }
            }

            const result = await BranchModels.updateBranch(branchId, data);

            if (!result) {
                return {
                    success: false,
                    error: 'INTERNAL_ERROR',
                    data: {}
                };
            }

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('BranchService.updateBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    deactivateBranch = async (id) => {
        try {
            const branchId = Number(id);

            const branch = await BranchModels.getBranchById(branchId);

            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND',
                    data: {}
                };
            }

            const result = await BranchModels.deactivateBranch(branchId);

            if (!result) {
                return {
                    success: false,
                    error: 'INTERNAL_ERROR',
                    data: {}
                };
            }

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('BranchService.deleteBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };
}

module.exports = new BranchService();