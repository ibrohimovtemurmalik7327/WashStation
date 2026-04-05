const db = require('../../db/connection');
const config = require('../../config/config');

const BookingModels = require('./booking.models');
const BranchModels = require('../branch/branch.models');
const MachineModels = require('../machine/machine.models');

const BOOKING_WASH_MINUTES = Number(config.booking?.WASH_MINUTES || 30);
const BOOKING_BUFFER_MINUTES = Number(config.booking?.BUFFER_MINUTES || 10);

class BookingService {
    createBooking = async (user_id, data) => {
        try {
            const normalizedUserId = Number(user_id);
            const branch_id = Number(data?.branch_id);
            const wash_mass_kg = Number(data?.wash_mass_kg);
            const desired_start_time = this._parseDate(data?.desired_start_time);

            if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
                return this._error('UNAUTHORIZED');
            }

            if (!Number.isInteger(branch_id) || branch_id <= 0) {
                return this._error('INVALID_BRANCH_ID');
            }

            if (!Number.isInteger(wash_mass_kg) || wash_mass_kg <= 0) {
                return this._error('INVALID_WASH_MASS');
            }

            if (!desired_start_time) {
                return this._error('INVALID_START_TIME');
            }

            if (desired_start_time.getTime() <= Date.now()) {
                return this._error('INVALID_START_TIME');
            }

            const slotTimes = this._calculateSlotTimes(desired_start_time);

            const result = await db.transaction(async (trx) => {
                const branch = await BranchModels.getBranchById(branch_id, trx);

                if (!branch) {
                    this._throwServiceError('BRANCH_NOT_FOUND');
                }

                if (branch.status !== 'active') {
                    this._throwServiceError('BRANCH_INACTIVE');
                }

                const activeMachines = await MachineModels.getActiveMachinesByBranch(
                    branch_id,
                    trx,
                    { forUpdate: true }
                );

                if (!Array.isArray(activeMachines) || activeMachines.length === 0) {
                    this._throwServiceError('NO_ACTIVE_MACHINES');
                }

                const normalizedMachines = activeMachines
                    .map((machine) => ({
                        ...machine,
                        id: Number(machine.id),
                        branch_id: Number(machine.branch_id),
                        capacity_kg: Number(machine.capacity_kg)
                    }))
                    .filter((machine) =>
                        Number.isInteger(machine.id) &&
                        machine.id > 0 &&
                        Number.isFinite(machine.capacity_kg) &&
                        machine.capacity_kg > 0
                    );

                if (normalizedMachines.length === 0) {
                    this._throwServiceError('NO_ACTIVE_MACHINES');
                }

                const busyMachineIds = await BookingModels.getBusyMachineIds(
                    branch_id,
                    slotTimes.slot_start_time,
                    slotTimes.slot_end_time,
                    trx
                );

                const busySet = new Set(busyMachineIds.map(Number));

                const availableMachines = normalizedMachines.filter(
                    (machine) => !busySet.has(machine.id)
                );

                if (availableMachines.length === 0) {
                    this._throwServiceError('NO_AVAILABLE_COMBINATION');
                }

                const combinations = this._buildCandidateCombinations(
                    availableMachines,
                    wash_mass_kg
                );

                if (combinations.length === 0) {
                    this._throwServiceError('NO_AVAILABLE_COMBINATION');
                }

                const bestCombination = this._pickBestCombination(
                    combinations,
                    wash_mass_kg
                );

                if (!bestCombination) {
                    this._throwServiceError('NO_AVAILABLE_COMBINATION');
                }

                const selectedMachineIds = bestCombination.machines.map((machine) => Number(machine.id));

                const recheckedBusyMachineIds = await BookingModels.getBusyMachineIds(
                    branch_id,
                    slotTimes.slot_start_time,
                    slotTimes.slot_end_time,
                    trx
                );

                const recheckedBusySet = new Set(recheckedBusyMachineIds.map(Number));

                const hasConflict = selectedMachineIds.some((id) => recheckedBusySet.has(id));

                if (hasConflict) {
                    this._throwServiceError('SLOT_ALREADY_TAKEN');
                }

                const bookingPayload = {
                    user_id: normalizedUserId,
                    branch_id,
                    wash_mass_kg,
                    requested_start_time: slotTimes.slot_start_time,
                    wash_end_time: slotTimes.wash_end_time,
                    buffer_end_time: slotTimes.slot_end_time,
                    total_capacity_kg: bestCombination.total_capacity_kg,
                    status: 'confirmed'
                };

                const booking = await BookingModels.createBooking(bookingPayload, trx);

                const bookingMachineItems = bestCombination.machines.map((machine) => ({
                    booking_id: booking.id,
                    machine_id: machine.id,
                    machine_capacity_kg: machine.capacity_kg,
                    slot_start_time: slotTimes.slot_start_time,
                    wash_end_time: slotTimes.wash_end_time,
                    slot_end_time: slotTimes.slot_end_time
                }));

                await BookingModels.createBookingMachines(bookingMachineItems, trx);

                const bookingDetails = await BookingModels.getBookingDetailsById(booking.id, trx);

                return {
                    success: true,
                    data: bookingDetails
                };
            });

            return result;
        } catch (error) {
            return this._handleError('BookingService.createBooking', error);
        }
    };

    getBooking = async (id, currentUser) => {
        try {
            const booking_id = Number(id);

            if (!currentUser?.id) {
                return this._error('UNAUTHORIZED');
            }

            if (!Number.isInteger(booking_id) || booking_id <= 0) {
                return this._error('INVALID_BOOKING_ID');
            }

            const booking = await BookingModels.getBookingDetailsById(booking_id);

            if (!booking) {
                return this._error('BOOKING_NOT_FOUND');
            }

            const isAdmin = currentUser.role === 'admin';
            const isOwner = Number(booking.user_id) === Number(currentUser.id);

            if (!isAdmin && !isOwner) {
                return this._error('FORBIDDEN');
            }

            return {
                success: true,
                data: booking
            };
        } catch (error) {
            return this._handleError('BookingService.getBooking', error);
        }
    };

    getBookings = async () => {
        try {
            const bookings = await BookingModels.getBookings();

            return {
                success: true,
                data: bookings
            };
        } catch (error) {
            return this._handleError('BookingService.getBookings', error);
        }
    };

    getMyBookings = async (user_id) => {
        try {
            const normalizedUserId = Number(user_id);

            if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
                return this._error('UNAUTHORIZED');
            }

            const bookings = await BookingModels.getBookingsByUser(normalizedUserId);

            return {
                success: true,
                data: bookings
            };
        } catch (error) {
            return this._handleError('BookingService.getMyBookings', error);
        }
    };

    getBookingsByBranch = async (branch_id) => {
        try {
            const normalizedBranchId = Number(branch_id);

            if (!Number.isInteger(normalizedBranchId) || normalizedBranchId <= 0) {
                return this._error('INVALID_BRANCH_ID');
            }

            const branch = await BranchModels.getBranchById(normalizedBranchId);

            if (!branch) {
                return this._error('BRANCH_NOT_FOUND');
            }

            const bookings = await BookingModels.getBookingsByBranch(normalizedBranchId);

            return {
                success: true,
                data: bookings
            };
        } catch (error) {
            return this._handleError('BookingService.getBookingsByBranch', error);
        }
    };

    cancelBooking = async (id, currentUser) => {
        try {
            const booking_id = Number(id);

            if (!currentUser?.id) {
                return this._error('UNAUTHORIZED');
            }

            if (!Number.isInteger(booking_id) || booking_id <= 0) {
                return this._error('INVALID_BOOKING_ID');
            }

            const result = await db.transaction(async (trx) => {
                const booking = await BookingModels.getBookingById(booking_id, trx);

                if (!booking) {
                    this._throwServiceError('BOOKING_NOT_FOUND');
                }

                const isAdmin = currentUser.role === 'admin';
                const isOwner = Number(booking.user_id) === Number(currentUser.id);

                if (!isAdmin && !isOwner) {
                    this._throwServiceError('FORBIDDEN');
                }

                if (booking.status === 'cancelled') {
                    this._throwServiceError('BOOKING_ALREADY_CANCELLED');
                }

                if (booking.status === 'completed') {
                    this._throwServiceError('BOOKING_ALREADY_COMPLETED');
                }

                const bookingStartTime = this._parseDate(booking.requested_start_time);

                if (!bookingStartTime) {
                    this._throwServiceError('INVALID_BOOKING_TIME');
                }

                if (bookingStartTime.getTime() <= Date.now()) {
                    this._throwServiceError('BOOKING_ALREADY_STARTED');
                }

                const updated = await BookingModels.cancelBooking(booking_id, trx);

                if (!updated) {
                    this._throwServiceError('BOOKING_NOT_FOUND');
                }

                const details = await BookingModels.getBookingDetailsById(booking_id, trx);

                return {
                    success: true,
                    data: details
                };
            });

            return result;
        } catch (error) {
            return this._handleError('BookingService.cancelBooking', error);
        }
    };

    completeBooking = async (id) => {
        try {
            const booking_id = Number(id);

            if (!Number.isInteger(booking_id) || booking_id <= 0) {
                return this._error('INVALID_BOOKING_ID');
            }

            const result = await db.transaction(async (trx) => {
                const booking = await BookingModels.getBookingById(booking_id, trx);

                if (!booking) {
                    this._throwServiceError('BOOKING_NOT_FOUND');
                }

                if (booking.status === 'cancelled') {
                    this._throwServiceError('BOOKING_CANCELLED');
                }

                if (booking.status === 'completed') {
                    this._throwServiceError('BOOKING_ALREADY_COMPLETED');
                }

                const washEndTime = this._parseDate(booking.wash_end_time);

                if (!washEndTime) {
                    this._throwServiceError('INVALID_BOOKING_TIME');
                }

                if (washEndTime.getTime() > Date.now()) {
                    this._throwServiceError('BOOKING_NOT_FINISHED_YET');
                }

                const updated = await BookingModels.updateBookingStatus(
                    booking_id,
                    'completed',
                    trx
                );

                if (!updated) {
                    this._throwServiceError('BOOKING_NOT_FOUND');
                }

                const details = await BookingModels.getBookingDetailsById(booking_id, trx);

                return {
                    success: true,
                    data: details
                };
            });

            return result;
        } catch (error) {
            return this._handleError('BookingService.completeBooking', error);
        }
    };

    _calculateSlotTimes = (startTime) => {
        const slot_start_time = new Date(startTime);
        const wash_end_time = this._addMinutes(slot_start_time, BOOKING_WASH_MINUTES);
        const slot_end_time = this._addMinutes(wash_end_time, BOOKING_BUFFER_MINUTES);

        return {
            slot_start_time,
            wash_end_time,
            slot_end_time
        };
    };

    _addMinutes = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60 * 1000);
    };

    _parseDate = (value) => {
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    _buildCandidateCombinations = (machines, targetKg) => {
        const candidates = [];

        const sortedMachines = [...machines].sort((a, b) => {
            if (Number(b.capacity_kg) !== Number(a.capacity_kg)) {
                return Number(b.capacity_kg) - Number(a.capacity_kg);
            }

            return Number(a.id) - Number(b.id);
        });

        const dfs = (index, currentMachines, currentTotal) => {
            if (currentTotal >= targetKg) {
                candidates.push({
                    machines: [...currentMachines],
                    total_capacity_kg: currentTotal,
                    machine_count: currentMachines.length,
                    excess_kg: currentTotal - targetKg
                });
                return;
            }

            if (index >= sortedMachines.length) {
                return;
            }

            dfs(index + 1, currentMachines, currentTotal);

            currentMachines.push(sortedMachines[index]);

            dfs(
                index + 1,
                currentMachines,
                currentTotal + Number(sortedMachines[index].capacity_kg)
            );

            currentMachines.pop();
        };

        dfs(0, [], 0);

        return candidates;
    };

    _pickBestCombination = (combinations, targetKg) => {
        if (!Array.isArray(combinations) || combinations.length === 0) {
            return null;
        }

        const ranked = [...combinations].sort((a, b) => {
            const aExactRank = a.total_capacity_kg === targetKg ? 0 : 1;
            const bExactRank = b.total_capacity_kg === targetKg ? 0 : 1;

            if (aExactRank !== bExactRank) {
                return aExactRank - bExactRank;
            }

            if (a.excess_kg !== b.excess_kg) {
                return a.excess_kg - b.excess_kg;
            }

            if (a.machine_count !== b.machine_count) {
                return a.machine_count - b.machine_count;
            }

            const aCaps = [...a.machines]
                .map((machine) => Number(machine.capacity_kg))
                .sort((x, y) => y - x);

            const bCaps = [...b.machines]
                .map((machine) => Number(machine.capacity_kg))
                .sort((x, y) => y - x);

            const maxLen = Math.max(aCaps.length, bCaps.length);

            for (let i = 0; i < maxLen; i += 1) {
                const aValue = aCaps[i] || 0;
                const bValue = bCaps[i] || 0;

                if (aValue !== bValue) {
                    return bValue - aValue;
                }
            }

            return 0;
        });

        return ranked[0] || null;
    };

    _error = (error, data = {}) => {
        return {
            success: false,
            error,
            data
        };
    };

    _throwServiceError = (code) => {
        const error = new Error(code);
        error.isServiceError = true;
        error.code = code;
        throw error;
    };

    _handleError = (scope, error) => {
        if (error?.isServiceError) {
            return this._error(error.code);
        }

        console.error(`${scope} error:`, error);

        return this._error('INTERNAL_ERROR');
    };
}

module.exports = new BookingService();