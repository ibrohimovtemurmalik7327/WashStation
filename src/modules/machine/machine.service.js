const MachineModels = require('./machine.models');

class MachineService {
    createMachine = async (data) => {
        try {
            const { branch_id, name } = data;

            const existingMachine = await MachineModels.getMachineByName(branch_id, name);
            if (existingMachine) {
                return {
                    success: false,
                    error: 'CONFLICT',
                    data: {}
                };
            }

            const result = await MachineModels.createMachine(data);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error(error);

            if (error.code === 'ER_DUP_ENTRY') {
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

    getMachines = async (branch_id) => {
        try {
            const result = await MachineModels.getMachines(branch_id);

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

    getMachine = async (branch_id, id) => {
        try {
            const result = await MachineModels.getMachine(branch_id, id);

            if (!result) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            }

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

    updateMachine = async (branch_id, id, data) => {
        try {
            const existingMachine = await MachineModels.getMachine(branch_id, id);
            if (!existingMachine) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            }

            if (data.name !== undefined) {
                const duplicateMachine = await MachineModels.getMachineByNameExceptId(
                    branch_id,
                    data.name,
                    id
                );

                if (duplicateMachine) {
                    return {
                        success: false,
                        error: 'CONFLICT',
                        data: {}
                    };
                }
            }

            const patch = {
                ...data,
                branch_id,
                id
            };

            const result = await MachineModels.updateMachine(patch);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error(error);

            if (error.code === 'ER_DUP_ENTRY') {
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

    deactivateMachine = async (branch_id, id) => {
        try {
            const existingMachine = await MachineModels.getMachine(branch_id, id);
            if (!existingMachine) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            }

            const result = await MachineModels.deactivateMachine(branch_id, id);

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
}

module.exports = new MachineService();