const Joi = require('joi');

const phoneRegex = /^\+[0-9]{9,15}$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
const otpCodeRegex = /^[0-9]{6}$/;

const phoneField = Joi.string()
    .trim()
    .pattern(phoneRegex)
    .required()
    .messages({
        'string.empty': 'phone is required',
        'string.pattern.base': 'phone must be in +998901234567 format',
        'any.required': 'phone is required'
    });

const usernameField = Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(usernameRegex)
    .required()
    .messages({
        'string.empty': 'username is required',
        'string.min': 'username must be at least 3 characters',
        'string.max': 'username must be at most 30 characters',
        'string.pattern.base': 'username may contain only letters, numbers, and underscore',
        'any.required': 'username is required'
    });

const passwordField = Joi.string()
    .min(8)
    .max(100)
    .pattern(strongPasswordRegex)
    .required()
    .messages({
        'string.empty': 'password is required',
        'string.min': 'password must be at least 8 characters',
        'string.max': 'password must be at most 100 characters',
        'string.pattern.base': 'password must include uppercase, lowercase, number, and special character',
        'any.required': 'password is required'
    });

const ticketIdField = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        'number.base': 'ticket_id must be a number',
        'number.integer': 'ticket_id must be an integer',
        'number.positive': 'ticket_id must be a positive number',
        'any.required': 'ticket_id is required'
    });

const otpCodeField = Joi.string()
    .trim()
    .pattern(otpCodeRegex)
    .required()
    .messages({
        'string.empty': 'code is required',
        'string.pattern.base': 'code must be a 6-digit number',
        'any.required': 'code is required'
    });

const registerStartSchema = Joi.object({
    username: usernameField,
    phone: phoneField,
    password: passwordField
}).required();

const registerVerifySchema = Joi.object({
    ticket_id: ticketIdField,
    code: otpCodeField
}).required();

const loginSchema = Joi.object({
    phone: phoneField,
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'password is required',
            'any.required': 'password is required'
        })
}).required();

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'oldPassword is required',
            'any.required': 'oldPassword is required'
        }),

    newPassword: Joi.string()
        .min(8)
        .max(100)
        .pattern(strongPasswordRegex)
        .invalid(Joi.ref('oldPassword'))
        .required()
        .messages({
            'string.empty': 'newPassword is required',
            'string.min': 'newPassword must be at least 8 characters',
            'string.max': 'newPassword must be at most 100 characters',
            'string.pattern.base': 'newPassword must include uppercase, lowercase, number, and special character',
            'any.invalid': 'newPassword must be different from oldPassword',
            'any.required': 'newPassword is required'
        })
}).required();

const forgotPasswordStartSchema = Joi.object({
    phone: phoneField
}).required();

const forgotPasswordVerifySchema = Joi.object({
    ticket_id: ticketIdField,
    code: otpCodeField,
    newPassword: Joi.string()
        .min(8)
        .max(100)
        .pattern(strongPasswordRegex)
        .required()
        .messages({
            'string.empty': 'newPassword is required',
            'string.min': 'newPassword must be at least 8 characters',
            'string.max': 'newPassword must be at most 100 characters',
            'string.pattern.base': 'newPassword must include uppercase, lowercase, number, and special character',
            'any.required': 'newPassword is required'
        })
}).required();

module.exports = {
    registerStartSchema,
    registerVerifySchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordStartSchema,
    forgotPasswordVerifySchema
};