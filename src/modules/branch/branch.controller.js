const BranchService = require('./branch.service');
const { sendResponse } = require('../../helpers/response.helper');

class BranchController {
    createBranch = async (req, res) => {
        const result = await BranchService.createBranch(req.body);
        return sendResponse(res, result, 201);
    };

    getBranch = async (req, res) => {
        const result = await BranchService.getBranch(req.params.id);
        return sendResponse(res, result, 200);
    };

    getBranches = async (req, res) => {
        const result = await BranchService.getBranches();
        return sendResponse(res, result, 200);
    };

    updateBranch = async (req, res) => {
        const result = await BranchService.updateBranch(req.params.id, req.body);
        return sendResponse(res, result, 200);
    };

    getActiveBranches = async (req, res) => {
        const result = await BranchService.getActiveBranches();
        return sendResponse(res, result, 200);
    };

    deactivateBranch = async (req, res) => {
        const result = await BranchService.deactivateBranch(req.params.id);
        return sendResponse(res, result, 200);
    };
};

module.exports = new BranchController();