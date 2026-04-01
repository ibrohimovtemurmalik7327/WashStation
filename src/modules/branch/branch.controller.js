const BranchService = require('./branch.service');
const sendResponse = require('../../helpers/sendResponse');

class BranchController {
    createBranch = async (req, res) => {
        const result = await BranchService.createBranch(req.body);
        return sendResponse(res, result, 201);
    };

    getBranches = async (req, res) => {
        const result = await BranchService.getBranches();
        return sendResponse(res, result);
    };

    getBranch = async (req, res) => {
        const result = await BranchService.getBranch(req.params.id);
        return sendResponse(res, result);
    };

    getActiveBranches = async (req, res) => {
        const result = await BranchService.getActiveBranches();
        return sendResponse(res, result);
    };

    updateBranch = async (req, res) => {
        const result = await BranchService.updateBranch(req.params.id, req.body);
        return sendResponse(res, result);
    };

    deactivateBranch = async (req, res) => {
        const result = await BranchService.deactivateBranch(req.params.id);
        return sendResponse(res, result);
    };
}

module.exports = new BranchController();