const db = require('../../db/connection');
const config = require('../../config/config');

const TB_BOOKINGS = config.tables?.TB_BOOKINGS || 'tb_bookings';
const TB_BOOKING_MACHINES = config.tables?.TB_BOOKING_MACHINES || 'tb_booking_machines';
const TB_MACHINES = config.tables?.TB_MACHINES || 'tb_machines';

class BookingModels {
    createBooking = async (data, trx = db) => {
        const [id] = await trx(TB_BOOKINGS).insert(data);
        return this.getBookingById(id, trx);
    };

    createBookingMachines = async (items, trx = db) => {
        const rows = Array.isArray(items) ? items : [];

        if (rows.length === 0) {
            return [];
        }

        const insertData = rows.map((item) => ({
            booking_id: item.booking_id,
            machine_id: item.machine_id,
            machine_capacity_kg: item.machine_capacity_kg,
            slot_start_time: item.slot_start_time,
            wash_end_time: item.wash_end_time,
            slot_end_time: item.slot_end_time
        }));

        await trx(TB_BOOKING_MACHINES).insert(insertData);

        const bookingId = insertData[0].booking_id;

        return trx(`${TB_BOOKING_MACHINES} as bbm`)
            .select(
                'bbm.id',
                'bbm.booking_id',
                'bbm.machine_id',
                'bbm.machine_capacity_kg',
                'bbm.slot_start_time',
                'bbm.wash_end_time',
                'bbm.slot_end_time',
                'bbm.created_at',
                'm.name as machine_name',
                'm.branch_id',
                'm.capacity_kg as current_machine_capacity_kg',
                'm.status as machine_status'
            )
            .leftJoin(`${TB_MACHINES} as m`, 'bbm.machine_id', 'm.id')
            .where('bbm.booking_id', bookingId)
            .orderBy('bbm.id', 'asc');
    };

    getBookingById = async (id, trx = db) => {
        return trx(TB_BOOKINGS)
            .where({ id })
            .first();
    };

    getBookings = async (trx = db) => {
        return trx(TB_BOOKINGS)
            .orderBy('id', 'desc');
    };

    getBookingsByUser = async (user_id, trx = db) => {
        return trx(TB_BOOKINGS)
            .where({ user_id })
            .orderBy('id', 'desc');
    };

    getBookingsByBranch = async (branch_id, trx = db) => {
        return trx(TB_BOOKINGS)
            .where({ branch_id })
            .orderBy('id', 'desc');
    };

    updateBookingStatus = async (id, status, trx = db) => {
        const updated = await trx(TB_BOOKINGS)
            .where({ id })
            .update({
                status,
                updated_at: trx.fn.now()
            });

        if (!updated) {
            return null;
        }

        return this.getBookingById(id, trx);
    };

    cancelBooking = async (id, trx = db) => {
        const updated = await trx(TB_BOOKINGS)
            .where({ id })
            .update({
                status: 'cancelled',
                updated_at: trx.fn.now()
            });

        if (!updated) {
            return null;
        }

        return this.getBookingById(id, trx);
    };

    getBookingMachines = async (booking_id, trx = db) => {
        return trx(`${TB_BOOKING_MACHINES} as bbm`)
            .select(
                'bbm.id',
                'bbm.booking_id',
                'bbm.machine_id',
                'bbm.machine_capacity_kg',
                'bbm.slot_start_time',
                'bbm.wash_end_time',
                'bbm.slot_end_time',
                'bbm.created_at',
                'm.name as machine_name',
                'm.branch_id',
                'm.capacity_kg as current_machine_capacity_kg',
                'm.status as machine_status'
            )
            .leftJoin(`${TB_MACHINES} as m`, 'bbm.machine_id', 'm.id')
            .where('bbm.booking_id', booking_id)
            .orderBy('bbm.id', 'asc');
    };

    getBusyMachineIds = async (branch_id, start_time, end_time, trx = db) => {
        const rows = await trx(`${TB_BOOKING_MACHINES} as bbm`)
            .distinct('bbm.machine_id')
            .innerJoin(`${TB_BOOKINGS} as b`, 'bbm.booking_id', 'b.id')
            .innerJoin(`${TB_MACHINES} as m`, 'bbm.machine_id', 'm.id')
            .where('b.branch_id', branch_id)
            .whereIn('b.status', ['pending', 'confirmed'])
            .where('m.status', 'active')
            .andWhere(function () {
                this.where('bbm.slot_start_time', '<', end_time)
                    .andWhere('bbm.slot_end_time', '>', start_time);
            });

        return rows.map((row) => row.machine_id);
    };

    getBookingDetailsById = async (id, trx = db) => {
        const booking = await this.getBookingById(id, trx);

        if (!booking) {
            return null;
        }

        const machines = await this.getBookingMachines(id, trx);

        return {
            ...booking,
            machines
        };
    };
}

module.exports = new BookingModels();