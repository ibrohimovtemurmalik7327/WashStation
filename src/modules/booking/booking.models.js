const config = require('../../config/config');
const db_laundry = require('../../db/connection');
const TB = config?.tables?.TB_BOOKINGS || 'tb_bookings';

class BookingModels {

    createBooking = async (data) => {
        const [id] = await db_laundry(TB).insert(data);
        return this.getBookingById(id);
    };

    getBookingById = (id) => {
        return db_laundry(TB).where({ id }).first();
    };

    getBookings = () => {
        return db_laundry(TB).select('*').orderBy('created_at', 'desc');
    };

    getBookingsByUser = (user_id) => {
        return db_laundry(TB).where({ user_id }).orderBy('created_at', 'desc');
    };

    getBookingsByMachine = (branch_id, machine_id) => {
        return db_laundry(TB).where({ branch_id, machine_id }).orderBy('start_time', 'asc');
    };

    findOverlappingBookings = (branch_id, machine_id, start_time, end_time) => {
        return db(TB)
            .where({
                branch_id,
                machine_id
            })
            .whereIn('status', ['pending', 'confirmed'])
            .where(function () {
                this.where('start_time', '<', end_time)
                    .andWhere('end_time', '>', start_time);
            });
    };

    updateBookingStatus = async (id, status) => {
        await db_laundry(TB).where({ id }).update({
            status,
            updated_at: db_laundry.fn.now()
        });

        return this.getBookingById(id);
    };

};

module.exports = new BookingModels();

