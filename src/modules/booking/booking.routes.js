const express = require('express');
const router = express.Router();

const BookingController = require('./booking.controller');
const { validate } = require('../../middlewares/validate');
const { roleRequired } = require('../../middlewares/auth.middleware');

const {
    idParamSchema,
    createBookingSchema,
    machineBookingsParamSchema,
    updateBookingStatusSchema
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
    '/',
    roleRequired('admin'),
    BookingController.getBookings
);

router.get(
    '/branches/:branch_id/machines/:machine_id/bookings',
    roleRequired('admin'),
    validate(machineBookingsParamSchema, 'params'),
    BookingController.getBookingsByMachine
);

router.get(
    '/:id',
    roleRequired('admin'),
    validate(idParamSchema, 'params'),
    BookingController.getBookingById
);

router.patch(
    '/:id/cancel',
    roleRequired('user'),
    validate(idParamSchema, 'params'),
    BookingController.cancelBooking
);

router.patch(
    '/:id/status',
    roleRequired('admin'),
    validate(idParamSchema, 'params'),
    validate(updateBookingStatusSchema),
    BookingController.updateBookingStatus
);

module.exports = router;