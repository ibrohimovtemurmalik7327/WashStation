const express = require('express');

const app = express();

const userRoutes = require('./modules/user/user.routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'WashStation API is running'
    });
});

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: 'ROUTE_NOT_FOUND'
    });
});

module.exports = app;