const express = require('express');
const router = express.Router();

const UserController = require('./user.controller');
const { validate } = require('../../middlewares/validate');

const {
  idParamSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema
} = require('./user.val');

router.post('/', validate(createUserSchema), UserController.createUser);

router.get('/', UserController.getUsers);

router.get('/:id', validate(idParamSchema, 'params'), UserController.getUser);

router.patch('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), UserController.updateUser);

router.patch('/:id/password', validate(idParamSchema, 'params'), validate(changePasswordSchema), UserController.changePassword);

router.delete('/:id', validate(idParamSchema, 'params'), UserController.deleteUser);

module.exports = router;