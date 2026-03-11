const config = require('../../config/config');
const db_laundry = require('../../db/connection');

const TB = config?.tables?.TB_MACHINES || 'tb_machines';

class MachineModels {
    createMachine = async (data) => {
        const { branch_id } = data;

        const [id] = await db_laundry(TB).insert(data);
        return this.getMachine(branch_id, id);
    };

    getMachines = (branch_id) => {
        return db_laundry(TB)
            .where({ branch_id });
    };

    getMachine = (branch_id, id) => {
        return db_laundry(TB)
            .where({ branch_id, id })
            .first();
    };

    getMachineByName = (branch_id, name) => {
        return db_laundry(TB)
            .where({ branch_id, name })
            .first();
    };

    getMachineByNameExceptId = (branch_id, name, id) => {
        return db_laundry(TB)
            .where({ branch_id, name })
            .whereNot({ id })
            .first();
    };

    updateMachine = async (data) => {
        const { branch_id, id, ...patch } = data;

        await db_laundry(TB)
            .where({ branch_id, id })
            .update(patch);

        return this.getMachine(branch_id, id);
    };

    deactivateMachine = async (branch_id, id) => {
        await db_laundry(TB)
            .where({ branch_id, id })
            .update({
                is_active: false
            });

        return this.getMachine(branch_id, id);
    };
}

module.exports = new MachineModels();