const BookingService = require('./booking.service');
const sendResponse = require('../../helpers/sendResponse');

class BookingController {
    createBooking = async (req, res) => {
        const result = await BookingService.createBooking(req.user?.id, req.body);
        return sendResponse(res, result, 201);
    };

    getBooking = async (req, res) => {
        const result = await BookingService.getBooking(req.params.id, req.user);
        return sendResponse(res, result);
    };

    getBookings = async (req, res) => {
        const result = await BookingService.getBookings();
        return sendResponse(res, result);
    };

    getMyBookings = async (req, res) => {
        const result = await BookingService.getMyBookings(req.user?.id);
        return sendResponse(res, result);
    };

    getBookingsByBranch = async (req, res) => {
        const result = await BookingService.getBookingsByBranch(req.params.branch_id);
        return sendResponse(res, result);
    };

    cancelBooking = async (req, res) => {
        const result = await BookingService.cancelBooking(req.params.id, req.user);
        return sendResponse(res, result);
    };

    completeBooking = async (req, res) => {
        const result = await BookingService.completeBooking(req.params.id);
        return sendResponse(res, result);
    };
}

module.exports = new BookingController();