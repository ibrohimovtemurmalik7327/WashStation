const Joi = require('joi');

const phoneRule = Joi.string()
    .trim()
    .pattern(/^\+\d{9,15}$/)
    .required()
    .messages({
        'string.empty': 'Phone is required',
        'string.pattern.base': 'Phone must be in format +998XXXXXXXXX',
        'any.required': 'Phone is required'
    });

const passwordRule = Joi.string()
    .trim()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/)
    .min(8)
    .max(100)
    .required()
    .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password must not exceed 100 characters',
        'any.required': 'Password is required'
    });

const codeRule = Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
        'string.empty': 'Code is required',
        'string.pattern.base': 'Code must be 6 digits',
        'any.required': 'Code is required'
    });

const ticketIdRule = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        'number.base': 'Ticket id must be a number',
        'number.integer': 'Ticket id must be an integer',
        'number.positive': 'Ticket id must be positive',
        'any.required': 'Ticket id is required'
    });

const registerStartSchema = Joi.object({
    phone: phoneRule,
    password: passwordRule
});

const registerVerifySchema = Joi.object({
    ticket_id: ticketIdRule,
    code: codeRule
});

const loginStartSchema = Joi.object({
    phone: phoneRule
});

const loginVerifySchema = Joi.object({
    ticket_id: ticketIdRule,
    code: codeRule
});

const resetPasswordStartSchema = Joi.object({
    phone: phoneRule,
    new_password: passwordRule.invalid(Joi.ref('old_password')).messages({
        'string.empty': 'New password is required',
        'string.min': 'New password must be at least 6 characters',
        'string.max': 'New password must not exceed 100 characters',
        'any.required': 'New password is required'
    })
});

const resetPasswordVerifySchema = Joi.object({
    ticket_id: ticketIdRule,
    code: codeRule
});

const resendOtpSchema = Joi.object({
    ticket_id: ticketIdRule
});

module.exports = {
    registerStartSchema,
    registerVerifySchema,
    loginStartSchema,
    loginVerifySchema,
    resetPasswordStartSchema,
    resetPasswordVerifySchema,
    resendOtpSchema
};