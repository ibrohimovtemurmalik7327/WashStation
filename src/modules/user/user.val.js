const Joi = require('joi');

const phoneRegex = /^\+[0-9]{9,15}$/;
const usernameRegex = /^[a-zA-Z0-9_.]+$/;
const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]).{8,}$/;

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

const createUserSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .pattern(usernameRegex)
        .required()
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must be at most 50 characters long',
            'string.pattern.base':
                'Username can contain only letters, numbers, underscore and dot',
            'any.required': 'Username is required'
        }),

    phone: Joi.string()
        .trim()
        .pattern(phoneRegex)
        .required()
        .messages({
            'string.base': 'Phone must be a string',
            'string.empty': 'Phone is required',
            'string.pattern.base':
                'Phone must be in international format like +998901234567',
            'any.required': 'Phone is required'
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(strongPasswordRegex)
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must be at most 128 characters long',
            'string.pattern.base':
                'Password must include uppercase, lowercase, number, and special character',
            'any.required': 'Password is required'
        })
});

const updateUserSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .pattern(usernameRegex)
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username cannot be empty',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must be at most 50 characters long',
            'string.pattern.base':
                'Username can contain only letters, numbers, underscore and dot'
        }),

    phone: Joi.string()
        .trim()
        .pattern(phoneRegex)
        .messages({
            'string.base': 'Phone must be a string',
            'string.empty': 'Phone cannot be empty',
            'string.pattern.base':
                'Phone must be in international format like +998901234567'
        })
})
    .min(1)
    .messages({
        'object.min': 'At least one field is required for update'
    });

const changePasswordSchema = Joi.object({
    old_password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            'string.base': 'Old password must be a string',
            'string.empty': 'Old password is required',
            'string.min': 'Old password must be at least 8 characters long',
            'string.max': 'Old password must be at most 128 characters long',
            'any.required': 'Old password is required'
        }),

    new_password: Joi.string()
        .min(8)
        .max(128)
        .pattern(strongPasswordRegex)
        .invalid(Joi.ref('old_password'))
        .required()
        .messages({
            'string.base': 'New password must be a string',
            'string.empty': 'New password is required',
            'string.min': 'New password must be at least 8 characters long',
            'string.max': 'New password must be at most 128 characters long',
            'string.pattern.base':
                'New password must include uppercase, lowercase, number, and special character',
            'any.invalid': 'New password must be different from old password',
            'any.required': 'New password is required'
        })
});

module.exports = {
    idParamSchema,
    createUserSchema,
    updateUserSchema,
    changePasswordSchema
};