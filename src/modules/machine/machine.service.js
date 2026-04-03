const MachineModels = require('./machine.models');
const BranchModels = require('../branch/branch.models');

class MachineService {
    createMachine = async (data) => {
        try {
            const { branch_id, name } = data;

            const branch = await BranchModels.getBranchById(branch_id);
            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND',
                    data: {}
                };
            }

            const existingMachine = await MachineModels.getMachineByBranchAndName(branch_id, name);
            if (existingMachine) {
                return {
                    success: false,
                    error: 'MACHINE_NAME_CONFLICT',
                    data: {}
                };
            }

            const result = await MachineModels.createMachine(data);

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
            console.error('MachineService.createMachine error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    getMachines = async () => {
        try {
            const machines = await MachineModels.getMachines();

            return {
                success: true,
                data: machines
            };
        } catch (error) {
            console.error('MachineService.getMachines error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: []
            };
        }
    };

    getMachinesByBranch = async (branch_id) => {
        try {
            const branch = await BranchModels.getBranchById(branch_id);
            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND',
                    data: []
                };
            }

            const machines = await MachineModels.getMachinesByBranch(branch_id);

            return {
                success: true,
                data: machines
            };
        } catch (error) {
            console.error('MachineService.getMachinesByBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: []
            };
        }
    };

    getActiveMachinesByBranch = async (branch_id) => {
        try {
            const branch = await BranchModels.getBranchById(branch_id);
            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND',
                    data: []
                };
            }

            const activeMachines = await MachineModels.getActiveMachinesByBranch(branch_id);

            return {
                success: true,
                data: activeMachines
            };
        } catch (error) {
            console.error('MachineService.getActiveMachinesByBranch error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: []
            };
        }
    };

    getMachine = async (id) => {
        try {
            const machine = await MachineModels.getMachineById(id);

            if (!machine) {
                return {
                    success: false,
                    error: 'MACHINE_NOT_FOUND',
                    data: {}
                };
            }

            return {
                success: true,
                data: machine
            };
        } catch (error) {
            console.error('MachineService.getMachine error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    updateMachine = async (id, data) => {
        try {
            const machine = await MachineModels.getMachineById(id);
            if (!machine) {
                return {
                    success: false,
                    error: 'MACHINE_NOT_FOUND',
                    data: {}
                };
            }

            if (data.name) {
                const existingMachine = await MachineModels.getMachineByBranchAndName(
                    machine.branch_id,
                    data.name
                );

                if (existingMachine && existingMachine.id !== machine.id) {
                    return {
                        success: false,
                        error: 'MACHINE_NAME_CONFLICT',
                        data: {}
                    };
                }
            }

            const result = await MachineModels.updateMachine(id, data);

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
            console.error('MachineService.updateMachine error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    deactivateMachine = async (id) => {
        try {
            const machine = await MachineModels.getMachineById(id);
            if (!machine) {
                return {
                    success: false,
                    error: 'MACHINE_NOT_FOUND',
                    data: {}
                };
            }

            const result = await MachineModels.deactivateMachine(id);

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
            console.error('MachineService.deactivateMachine error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };
}

module.exports = new MachineService();