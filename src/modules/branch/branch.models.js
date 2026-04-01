const db = require('../../db/connection');
const config = require('../../config/config');

const TB = config.tables?.TB_BRANCHES || 'tb_branches';

const columns = [
'id',
'name',
'phone',
'address',
'latitude',
'longitude',
'status',
'created_at',
'updated_at'
];

class BranchModels {

    createBranch = async (data) => {
        const [id] = await db(TB).insert(data);
        return this.getBranchById(id);
    };

    getBranches = async () => {
        return db(TB)
            .select(columns)
            .orderBy('id', 'desc');
    };

    getBranchById = async (id) => {
        return db(TB)
            .select(columns)
            .where({ id })
            .first();
    };

    getActiveBranches = async () => {
        return db(TB)
            .select(columns)
            .where({ status: 'active' })
            .orderBy('id', 'desc');
    };

    updateBranch = async (id, data) => {
        await db(TB)
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            });

        return this.getBranchById(id);
    };

    deactivateBranch = async (id) => {
        await db(TB)
            .where({ id })
            .update({
                status: 'inactive',
                updated_at: db.fn.now()
            });

        return this.getBranchById(id);
    };

    getByPhone = async (phone) => {
        return db(TB)
            .select(columns)
            .where({ phone })
            .first();
    };
}

module.exports = new BranchModels();