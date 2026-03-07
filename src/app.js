const express = require('express');
const app = express();

const { authRequired } = require('./middlewares/auth.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authRequired, userRoutes);

module.exports = app;