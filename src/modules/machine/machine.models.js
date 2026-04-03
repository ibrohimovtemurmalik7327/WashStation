const db = require('../../db/connection');
const config = require('../../config/config');

const TB = config.tables?.TB_MACHINES || 'tb_machines';

const columns = [
    'id',
    'branch_id',
    'name',
    'capacity_kg',
    'status',
    'created_at',
    'updated_at'
];

class MachineModels {
    createMachine = async (data) => {
        const [id] = await db(TB).insert(data);
        return this.getMachineById(id);
    };

    getMachineById = async (id) => {
        return db(TB)
        .select(columns)
        .where({ id })
        .first();
    };

    getMachines = async () => {
        return await db(TB)
        .select(columns)
        .orderBy('id', 'desc');
    };

    getMachinesByBranch = async (branch_id) => {
        return db(TB)
        .select(columns)
        .where({ branch_id })
        .orderBy('id', 'desc');
    };

    getActiveMachinesByBranch = async (branch_id) => {
        return db(TB)
            .select(columns)
            .where({
                branch_id,
                status: 'active'
            })
            .orderBy('id', 'desc');
    };

    getMachineByBranchAndName = async (branch_id, name) => {
        return db(TB)
            .select(columns)
            .where({ branch_id, name })
            .first();
    };

    updateMachine = async (id, data) => {
        await db(TB).where({ id }).update({
            ...data,
            updated_at: db.fn.now()
        });

        return this.getMachineById(id);
    };

    deactivateMachine = async (id) => {
        await db(TB).where({ id }).update({
            status: 'inactive',
            updated_at: db.fn.now()
        });

        return this.getMachineById(id);
    };
}

module.exports = new MachineModels();