const Joi = require('joi');

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
const phoneRule = /^\+\d{9,15}$/;

const baseOptions = { abortEarly: true, stripUnknown: false, convert: true };

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})
  .unknown(false)
  .options(baseOptions);

const createUserSchema = Joi.object({
  phone: Joi.string().pattern(phoneRule).required(),
  password: Joi.string().min(8).pattern(passwordRule).required(),
})
  .unknown(false)
  .options(baseOptions);

const updateUserSchema = Joi.object({
  phone: Joi.string().pattern(phoneRule).optional(),
})
  .min(1)
  .unknown(false)
  .options(baseOptions);

const changePasswordSchema = Joi.object({
  old_password: Joi.string().min(8).pattern(passwordRule).required(),
  new_password: Joi.string().min(8).pattern(passwordRule).required().invalid(Joi.ref('old_password')),
})
  .unknown(false)
  .options(baseOptions);

module.exports = {
  idParamSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
};