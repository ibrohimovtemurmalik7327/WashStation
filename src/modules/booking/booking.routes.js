const express = require('express');
const router = express.Router();

const BookingController = require('./booking.controller');
const { validate } = require('../../middlewares/validate');
const { roleRequired } = require('../../middlewares/auth.middleware');

const {
    createBookingSchema,
    bookingIdParamSchema,
    branchIdParamSchema
} = require('./booking.val');

router.post(
    '/',
    roleRequired('user'),
    validate(createBookingSchema),
    BookingController.createBooking
);

router.get(
    '/my',
    roleRequired('user'),
    BookingController.getMyBookings
);

router.get(
    '/branch/:branch_id',
    roleRequired('admin'),
    validate(branchIdParamSchema, 'params'),
    BookingController.getBookingsByBranch
);

router.get(
    '/',
    roleRequired('admin'),
    BookingController.getBookings
);

router.get(
    '/:id',
    roleRequired('admin', 'user'),
    validate(bookingIdParamSchema, 'params'),
    BookingController.getBooking
);

router.patch(
    '/:id/cancel',
    roleRequired('user'),
    validate(bookingIdParamSchema, 'params'),
    BookingController.cancelBooking
);

router.patch(
    '/:id/complete',
    roleRequired('admin'),
    validate(bookingIdParamSchema, 'params'),
    BookingController.completeBooking
);

module.exports = router;