const { date } = require('joi');
const MachineModels = require('./machine.models');

class MachineService {
    createMachine = async (data) => {
        try {
            const { branch_id, name } = data;
            const doesExist = await MachineModels.getMachineByName(branch_id, name);
            if (doesExist) {
                return {
                    success: false,
                    error: 'CONFLICT',
                    data: {}
                };
            };

            const result = await MachineModels.createMachine(data);
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

    getMachines = async (data) => {
        const { branch_id } = data;
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

    getMachine = async (data) => {
        const { branch_id, id } = data;
        try {
            const result = await MachineModels.getMachine(branch_id, id);

            return {
                success: true, 
                data: result
            };
        } catch (error) {
            console.error(error);
            
            return {
                success: false,
                error: 'INTERNAl_ERROR',
                data: {}
            };
        }
    };

    updateMachine = async (data) => {
        try {
            const { branch_id, id } = data;
            const doesExist = await MachineModels.getMachine(branch_id, id);
            if (!doesExist) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            };

            const result = await MachineModels.updateMachine(data);
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

    deactivateMachine = async (data) => {
        try {
            const { branch_id, id } = data;
            const doesExist = await MachineModels.getMachine(branch_id, id);
            if (!doesExist) {
                return {
                    success: false,
                    error: 'NOT_FOUND',
                    data: {}
                };
            };

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
};

module.exports = new MachineService();