const express = require('express');
const app = express();

const { authRequired } = require('./middlewares/auth.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const branchRoutes = require('./modules/branch/branch.routes');
const machineRoutes = require('./modules/machine/machine.routes');
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authRequired, userRoutes);
app.use('/api/branches', authRequired, branchRoutes);
app.use('/api', authRequired, machineRoutes);

module.exports = app;