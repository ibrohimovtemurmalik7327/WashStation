const express = require('express');
const router = express.Router();

const UserController = require('./user.controller');
const { validate } = require('../../middlewares/validate');
const { roleRequired } = require('../../middlewares/auth.middleware');

const {
    idParamSchema,
    createUserSchema,
    updateUserSchema,
    changePasswordSchema
} = require('./user.val');


router.post(
    '/',
    roleRequired('admin'),
    validate(createUserSchema),
    UserController.createUser
);

router.get(
    '/',
    roleRequired('admin'),
    UserController.getUsers
);

router.get(
    '/:id',
    roleRequired('admin'),
    validate(idParamSchema, 'params'),
    UserController.getUser
);

router.patch(
    '/:id',
    roleRequired('admin'),
    validate(idParamSchema, 'params'),
    validate(updateUserSchema),
    UserController.updateUser
);

router.patch(
    '/:id/password',
    roleRequired('admin','user'),
    validate(idParamSchema, 'params'),
    validate(changePasswordSchema),
    UserController.changePassword
);

router.delete(
    '/:id',
    roleRequired('admin'),
    validate(idParamSchema, 'params'),
    UserController.deactivateUser
);

module.exports = router;