const MachineService = require('./machine.service');
const { sendResponse } = require('../../helpers/response.helper');

class MachineController {
    createMachine = async (req, res) => {
        const result = await MachineService.createMachine({
            ...req.body,
            branch_id: req.params.branch_id
        });

        return sendResponse(res, result, 201);
    };

    getMachines = async (req, res) => {
        const result = await MachineService.getMachines(req.params.branch_id);
        return sendResponse(res, result, 200);
    };

    getMachine = async (req, res) => {
        const result = await MachineService.getMachine(
            req.params.branch_id,
            req.params.id
        );

        return sendResponse(res, result, 200);
    };

    updateMachine = async (req, res) => {
        const result = await MachineService.updateMachine(
            req.params.branch_id,
            req.params.id,
            req.body
        );

        return sendResponse(res, result, 200);
    };

    deactivateMachine = async (req, res) => {
        const result = await MachineService.deactivateMachine(
            req.params.branch_id,
            req.params.id
        );

        return sendResponse(res, result, 200);
    };
}

module.exports = new MachineController();