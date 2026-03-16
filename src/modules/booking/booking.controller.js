const BookingService = require('./booking.service');
const { sendResponse } = require('../../helpers/response.helper');

class BookingController {
    createBooking = async (req, res) => {
        const result = await BookingService.createBooking(req.user?.id, req.body);
        return sendResponse(res, result, 201);
    };

    getBookingById = async (req, res) => {
        const result = await BookingService.getBookingById(req.params.id);
        return sendResponse(res, result, 200);
    };

    getBookings = async (req, res) => {
        const result = await BookingService.getBookings();
        return sendResponse(res, result, 200);
    };

    getMyBookings = async (req, res) => {
        const result = await BookingService.getMyBookings(req.user?.id);
        return sendResponse(res, result, 200);
    };

    getBookingsByMachine = async (req, res) => {
        const { branch_id, machine_id } = req.params;

        const result = await BookingService.getBookingsByMachine(
            branch_id,
            machine_id
        );

        return sendResponse(res, result, 200);
    };

    cancelBooking = async (req, res) => {
        const result = await BookingService.cancelBooking(req.params.id);
        return sendResponse(res, result, 200);
    };

    updateBookingStatus = async (req, res) => {
        const result = await BookingService.updateBookingStatus(
            req.params.id,
            req.body?.status
        );

        return sendResponse(res, result, 200);
    };
}

module.exports = new BookingController();