const Joi = require('joi');

const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});

const createBookingSchema = Joi.object({
    branch_id: Joi.number()
        .integer()
        .positive()
        .required(),

    machine_id: Joi.number()
        .integer()
        .positive()
        .required(),

    start_time: Joi.date()
        .iso()
        .required(),

    end_time: Joi.date()
        .iso()
        .greater(Joi.ref('start_time'))
        .required(),

    notes: Joi.string()
        .max(500)
        .optional()
});

const machineBookingsParamSchema = Joi.object({
    branch_id: Joi.number()
        .integer()
        .positive()
        .required(),

    machine_id: Joi.number()
        .integer()
        .positive()
        .required()
});

const updateBookingStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'completed', 'cancelled')
        .required()
});

module.exports = {
    idParamSchema,
    createBookingSchema,
    machineBookingsParamSchema,
    updateBookingStatusSchema
};