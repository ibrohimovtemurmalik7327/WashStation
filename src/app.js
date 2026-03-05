const express = require('express');
const userRoutes = require('./modules/user/user.routes');
const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

module.exports = app;