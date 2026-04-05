const Joi = require('joi');

const id = Joi.number()
    .integer()
    .positive()
    .required();

const branchIdParamSchema = Joi.object({
    branch_id: id
});

const bookingIdParamSchema = Joi.object({
    id: id
});

const createBookingSchema = Joi.object({
    branch_id: id,

    wash_mass_kg: Joi.number()
        .positive()
        .max(50)
        .precision(2)
        .required(),

    desired_start_time: Joi.date()
        .iso()
        .required()
});

module.exports = {
    createBookingSchema,
    bookingIdParamSchema,
    branchIdParamSchema
};