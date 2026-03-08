const Joi = require('joi');

const phoneRule = /^\+\d{9,15}$/;

const baseOptions = { abortEarly: true, stripUnknown: false, convert: true };

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})
  .unknown(false)
  .options(baseOptions);

const createBranchSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  phone: Joi.string().pattern(phoneRule).required(),
  address: Joi.string().trim().min(5).max(255).required(),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
})
  .unknown(false)
  .options(baseOptions);

const updateBranchSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  phone: Joi.string().pattern(phoneRule).optional(),
  address: Joi.string().trim().min(5).max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
})
  .min(1)
  .unknown(false)
  .options(baseOptions);

module.exports = {
  idParamSchema,
  createBranchSchema,
  updateBranchSchema,
};