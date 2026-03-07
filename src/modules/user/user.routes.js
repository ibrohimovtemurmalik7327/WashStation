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

const { roleRequired, selfOrAdmin } = require('../../middlewares/auth.middleware');

router.post('/', roleRequired('admin'), validate(createUserSchema), UserController.createUser);

router.get('/', roleRequired('admin'), UserController.getUsers);

router.delete('/:id', roleRequired('admin'), validate(idParamSchema, 'params'), UserController.deleteUser);

router.get('/me', UserController.getMe);

router.get('/:id', validate(idParamSchema, 'params'), selfOrAdmin, UserController.getUser);

router.patch('/:id', validate(idParamSchema, 'params'), selfOrAdmin, validate(updateUserSchema), UserController.updateUser);

router.patch('/:id/password', validate(idParamSchema, 'params'), selfOrAdmin, validate(changePasswordSchema), UserController.changePassword);

module.exports = router;