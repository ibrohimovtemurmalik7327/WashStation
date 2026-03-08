    const config = require('../../config/config');
    const db_laundry = require('../../db/connection');

    const TB = config?.tables?.TB_BRANCHES || 'tb_branches';

    const BRANCH_DETAIL_FIELDS = [
        'id',
        'name',
        'phone',
        'address',
        'latitude',
        'longitude',
        'status',
        'created_at',
        'updated_at',
    ];

    class BranchModels {
        createBranch = async (data) => {
            const [id] = await db_laundry(TB).insert(data);
            return this.getBranchById(id);
        };

        getBranches = () => {
            return db_laundry(TB).select(...BRANCH_DETAIL_FIELDS);
        };

        getBranchById = (id) => {
            return db_laundry(TB).select(...BRANCH_DETAIL_FIELDS).where({ id })
            .first();
        };

        updateBranch = async (id, data) => {
            const result = await db_laundry(TB).where({ id }).update({
                ...data,
                updated_at: db_laundry.fn.now()
            });

            if(!result) return null;

            return this.getBranchById(id);
        };

        deactivateBranch = async (id) => {
            const result =  await db_laundry(TB).where({ id }).update({
                status: 'inactive',
                updated_at: db_laundry.fn.now()
            });

            if(!result) return null;

            return this.getBranchById(id);
        };

        getActiveBranches = () => {
            return db_laundry(TB).select(...BRANCH_DETAIL_FIELDS).where({ status: 'active' });
        };

        getByPhone = (phone) => {
            return db_laundry(TB).select(...BRANCH_DETAIL_FIELDS).where({ phone }).first();
        };
    };

    module.exports = new BranchModels();