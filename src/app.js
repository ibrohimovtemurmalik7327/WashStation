const express = require('express');
const app = express();

app.use(express.json());

const userRoutes = require('./modules/user/user.routes');
const branchRoutes = require('./modules/branch/branch.routes');
const machineRoutes = require('./modules/machine/machine.routes');

app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/machines', machineRoutes);

module.exports = app;