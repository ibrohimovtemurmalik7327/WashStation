const Joi = require('joi');

const machineNamePattern = /^Machine\d+$/;

const createMachineSchema = Joi.object({
    name: Joi.string()
        .pattern(machineNamePattern)
        .required()
        .messages({
            'string.pattern.base': 'Machine name must be like Machine1, Machine2, Machine3'
        }),

    type: Joi.string().required(),

    status: Joi.string()
        .valid('idle', 'busy', 'maintenance', 'offline')
        .optional(),

    is_active: Joi.boolean().optional()
});

const updateMachineSchema = Joi.object({
    name: Joi.string()
        .pattern(machineNamePattern)
        .optional()
        .messages({
            'string.pattern.base': 'Machine name must be like Machine1, Machine2, Machine3'
        }),

    type: Joi.string().optional(),

    status: Joi.string()
        .valid('idle', 'busy', 'maintenance', 'offline')
        .optional(),

    is_active: Joi.boolean().optional()
}).min(1);

const machineIdParamSchema = Joi.object({
    branch_id: Joi.number().integer().positive().required(),
    id: Joi.number().integer().positive().required()
});

const branchIdParamSchema = Joi.object({
    branch_id: Joi.number().integer().positive().required()
});

module.exports = {
    createMachineSchema,
    updateMachineSchema,
    machineIdParamSchema,
    branchIdParamSchema
};