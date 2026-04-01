const express = require('express');
const router = express.Router();

const BranchController = require('./branch.controller');
const { validate } = require('../../middlewares/validate');

const {
    idParamSchema,
    createBranchSchema,
    updateBranchSchema
} = require('./branch.val');

router.post('/', validate(createBranchSchema), BranchController.createBranch);

router.get('/', BranchController.getBranches);

router.get('/active', BranchController.getActiveBranches);

router.get('/:id', validate(idParamSchema, 'params'), BranchController.getBranch);

router.patch(
    '/:id',
    validate(idParamSchema, 'params'),
    validate(updateBranchSchema),
    BranchController.updateBranch
);

router.delete(
    '/:id',
    validate(idParamSchema, 'params'),
    BranchController.deleteBranch
);

module.exports = router;