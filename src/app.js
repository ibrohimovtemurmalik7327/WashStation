const express = require('express');
const app = express();

app.use(express.json());

const userRoutes = require('./modules/user/user.routes');
const branchRoutes = require('./modules/branch/branch.routes');

app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);

module.exports = app;