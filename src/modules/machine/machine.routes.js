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
    '/branches/:branch_id/machines',
    roleRequired('admin'),
    validate(branchIdParamSchema, 'params'),
    validate(createMachineSchema),
    MachineController.createMachine
);

router.get(
    '/branches/:branch_id/machines',
    validate(branchIdParamSchema, 'params'),
    MachineController.getMachines
);

router.get(
    '/branches/:branch_id/machines/:id',
    validate(machineIdParamSchema, 'params'),
    MachineController.getMachine
);

router.patch(
    '/branches/:branch_id/machines/:id',
    roleRequired('admin'),
    validate(machineIdParamSchema, 'params'),
    validate(updateMachineSchema),
    MachineController.updateMachine
);

router.delete(
    '/branches/:branch_id/machines/:id',
    roleRequired('admin'),
    validate(machineIdParamSchema, 'params'),
    MachineController.deactivateMachine
);

module.exports = router;