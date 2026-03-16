const BookingModels = require('./booking.models');
const MachineModules = require('../machine/machine.models');
const BranchModules = require('../branch/branch.models');

class BookingService {

    createBooking = async (user_id, data) => {
        const {
            branch_id,
            machine_id,
            start_time,
            end_time
        } = data;

        const branch = await BranchModules.getBranchById(branch_id);
        if (!branch) {
            return {
                success: false,
                error: 'BRANCH_NOT_FOUND',
                data: {}
            };
        };

        const machine = await MachineModules.getMachine(machine_id);
        if (!machine) {
            return {
                success: false,
                error: 'MACHINE_NOT_FOUND',
                data: {}
            };
        };
        if (machine.branch_id !== branch_id) {
            return {
                success: false,
                error: 'MACHINE_BRANCH_MISMATCH',
                data: {}
            };
        };

        if (new Date(end_time) <= new Date(start_time)) {
            return {
                success: false,
                error: 'INVALID_TIME_RANGE',
                data: {}
            };
        };

        const conflicts = await BookingModels.findOverlappingBookings(
            branch_id,
            machine_id,
            start_time,
            end_time
        );

        if (conflicts.length > 0) {
            return {
                success: false,
                error: 'TIME_CONFLICT',
                data: {}
            };
        };

        const booking = await BookingModels.createBooking({
            user_id,
            ...data
        });

        return {
            success: true,
            data: booking
        };
    };

    getBookingById = async (id) => {
        const booking = await BookingModels.getBookingById(id);
        if (!booking) {
            return {
                success: false,
                error: 'BOOKING_NOT_FOUND',
                data: {}
            };
        };

        return {
            success: true,
            data: booking
        };
    };

    getBookings = async () => {
        const bookings = await BookingModels.getBookings();

        return {
            success: true,
            data: bookings
        };
    };

    getMyBookings = async (user_id) => {
        const bookings = await BookingModels.getBookingsByUser(user_id);

        return {
            success: true,
            data: bookings
        };
    };

    getBookingsByMachine = async (branch_id, machine_id) => {
        const branch = await BranchModules.getBranchById(branch_id);
        if (!branch) {
            return {
                success: false,
                error: 'BRANCH_NOT_FOUND',
                data: {}
            };
        };

        const machine = await MachineModules.getMachine(machine_id);
        if (!machine) {
            return {
                success: false,
                error: 'MACHINE_NOT_FOUND',
                data: {}
            };
        };
        if (machine.branch_id !== branch_id) {
            return {
                success: false,
                error: 'MACHINE_BRANCH_MISMATCH',
                data: {}
            };
        };

        const bookings = await BookingModels.getBookingsByMachine(branch_id, machine_id);

        return {
            success: true,
            data: bookings
        };
    };

    cancelBooking = async (id) => {
        const booking = await BookingModels.getBookingById(id);
        if (!booking) {
            return {
                success: false,
                error: 'BOOKING_NOT_FOUND',
                data: {}
            };
        };

        if (!['pending', 'confirmed'].includes(booking.status)) {
            return {
                success: false,
                error: 'BOOKING_CANNOT_BE_CANCELLED',
                data: {}
            };
        };

        const cancelled = await BookingModels.updateBookingStatus(id, 'cancelled');

        return {
            success: true,
            data: cancelled
        };
    };

    updateBookingStatus = async (id, status) => {
        const booking = await BookingModels.getBookingById(id);
        if (!booking) {
            return {
                success: false,
                error: 'BOOKING_NOT_FOUND',
                data: {}
            };
        }

        const allowedTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['completed', 'cancelled'],
            cancelled: [],
            completed: []
        };

        const nextStatuses = allowedTransitions[booking.status] || [];

        if (!nextStatuses.includes(status)) {
            return {
                success: false,
                error: 'INVALID_STATUS_TRANSITION',
                data: {}
            };
        }

        const updated = await BookingModels.updateBookingStatus(id, status);

        return {
            success: true,
            data: updated
        };
    };

};

module.exports = new BookingService();