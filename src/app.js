const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const branchRoutes = require('./modules/branch/branch.routes');
const machineRoutes = require('./modules/machine/machine.routes');
const bookingRoutes = require('./modules/booking/booking.routes');

const { authRequired } = require('./middlewares/auth.middleware');

app.use('/api/auth', authRoutes);

app.use('/api/users', authRequired, userRoutes);
app.use('/api/branches', authRequired, branchRoutes);
app.use('/api/machines', authRequired, machineRoutes);
app.use('/api/bookings', authRequired, bookingRoutes);


module.exports = app;