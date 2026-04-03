const MachineService = require('./machine.service');
const sendResponse = require('../../helpers/sendResponse');

class MachineController {
    createMachine = async (req, res) => {
        const result = await MachineService.createMachine(req.body);
        return sendResponse(res, result, 201);
    };

    getMachines = async (req, res) => {
        const result = await MachineService.getMachines();
        return sendResponse(res, result);
    };

    getMachine = async (req, res) => {
        const result = await MachineService.getMachine(req.params.id);
        return sendResponse(res, result);
    };

    getMachinesByBranch = async (req, res) => {
        const result = await MachineService.getMachinesByBranch(req.params.branch_id);
        return sendResponse(res, result);
    };

    getActiveMachinesByBranch = async (req, res) => {
        const result = await MachineService.getActiveMachinesByBranch(req.params.branch_id);
        return sendResponse(res, result);
    };

    updateMachine = async (req, res) => {
        const result = await MachineService.updateMachine(req.params.id, req.body);
        return sendResponse(res, result);
    };

    deactivateMachine = async (req, res) => {
        const result = await MachineService.deactivateMachine(req.params.id);
        return sendResponse(res, result);
    };
}

module.exports = new MachineController();