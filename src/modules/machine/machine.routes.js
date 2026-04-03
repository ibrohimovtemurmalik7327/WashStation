const express = require('express');
const router = express.Router();

const MachineController = require('./machine.controller');

const { validate } = require('../../middlewares/validate')

const {
    createMachineSchema,
    updateMachineSchema,
    machineIdParamSchema,
    branchIdParamSchema
} = require('./machine.val');

router.post(
    '/',
    validate(createMachineSchema),
    MachineController.createMachine
);

router.get(
    '/',
    MachineController.getMachines
);

router.get(
    '/branch/:branch_id/active',
    validate(branchIdParamSchema, 'params'),
    MachineController.getActiveMachinesByBranch
);

router.get(
    '/branch/:branch_id',
    validate(branchIdParamSchema, 'params'),
    MachineController.getMachinesByBranch
);

router.get(
    '/:id',
    validate(machineIdParamSchema, 'params'),
    MachineController.getMachine
);

router.patch(
    '/:id',
    validate(machineIdParamSchema, 'params'),
    validate(updateMachineSchema),
    MachineController.updateMachine
);

router.delete(
    '/:id',
    validate(machineIdParamSchema, 'params'),
    MachineController.deactivateMachine
);

module.exports = router;