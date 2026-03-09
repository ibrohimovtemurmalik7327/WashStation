const express = require('express');
const router = express.Router();

const BranchController = require('./branch.controller');
const { validate } = require('../../middlewares/validate');
const { roleRequired } = require('../../middlewares/auth.middleware');

const {
  idParamSchema,
  createBranchSchema,
  updateBranchSchema,
} = require('./branch.val');

router.post('/', roleRequired('admin'), validate(createBranchSchema), BranchController.createBranch);

router.get('/', roleRequired('admin'), BranchController.getBranches);

router.get('/active', BranchController.getActiveBranches);

router.get('/:id', roleRequired('admin'), validate(idParamSchema, 'params'), BranchController.getBranch);

router.patch(
  '/:id',
  roleRequired('admin'),
  validate(idParamSchema, 'params'),
  validate(updateBranchSchema),
  BranchController.updateBranch
);

router.delete(
  '/:id',
  roleRequired('admin'),
  validate(idParamSchema, 'params'),
  BranchController.deactivateBranch
);

module.exports = router;