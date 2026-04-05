const db = require('../../db/connection');
const config = require('../../config/config');

const TB_MACHINES = config.tables?.TB_MACHINES || 'tb_machines';

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
        const [id] = await db(TB_MACHINES).insert(data);
        return this.getMachineById(id);
    };

    getMachineById = async (id) => {
        return db(TB_MACHINES)
        .select(columns)
        .where({ id })
        .first();
    };

    getMachines = async () => {
        return await db(TB_MACHINES)
        .select(columns)
        .orderBy('id', 'desc');
    };

    getMachinesByBranch = async (branch_id) => {
        return db(TB_MACHINES)
        .select(columns)
        .where({ branch_id })
        .orderBy('id', 'desc');
    };

    getActiveMachinesByBranch = async (branch_id, trx = db, options = {}) => {
        const query = trx(TB_MACHINES)
            .select(columns)
            .where({ branch_id, status: 'active' })
            .orderBy('capacity_kg', 'desc')
            .orderBy('id', 'asc');

        if (options.forUpdate) {
            query.forUpdate();
        }

        return query;
    };

    getMachineByBranchAndName = async (branch_id, name) => {
        return db(TB_MACHINES)
            .select(columns)
            .where({ branch_id, name })
            .first();
    };

    updateMachine = async (id, data) => {
        await db(TB_MACHINES).where({ id }).update({
            ...data,
            updated_at: db.fn.now()
        });

        return this.getMachineById(id);
    };

    deactivateMachine = async (id) => {
        await db(TB_MACHINES).where({ id }).update({
            status: 'inactive',
            updated_at: db.fn.now()
        });

        return this.getMachineById(id);
    };
}

module.exports = new MachineModels();