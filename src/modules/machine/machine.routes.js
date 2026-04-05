const express = require('express');
const router = express.Router();

const MachineController = require('./machine.controller');
const { validate } = require('../../middlewares/validate');
const { roleRequired } = require('../../middlewares/auth.middleware');

const {
    createMachineSchema,
    updateMachineSchema,
    machineIdParamSchema,
    branchIdParamSchema
} = require('./machine.val');

router.post(
    '/',
    roleRequired('admin'),
    validate(createMachineSchema),
    MachineController.createMachine
);

router.get(
    '/',
    roleRequired('admin'),
    MachineController.getMachines
);

router.get(
    '/branch/:branch_id/active',
    roleRequired('admin', 'user'),
    validate(branchIdParamSchema, 'params'),
    MachineController.getActiveMachinesByBranch
);

router.get(
    '/branch/:branch_id',
    roleRequired('admin'),
    validate(branchIdParamSchema, 'params'),
    MachineController.getMachinesByBranch
);

router.get(
    '/:id',
    roleRequired('admin'),
    validate(machineIdParamSchema, 'params'),
    MachineController.getMachine
);

router.patch(
    '/:id',
    roleRequired('admin'),
    validate(machineIdParamSchema, 'params'),
    validate(updateMachineSchema),
    MachineController.updateMachine
);

router.delete(
    '/:id',
    roleRequired('admin'),
    validate(machineIdParamSchema, 'params'),
    MachineController.deactivateMachine
);

module.exports = router;