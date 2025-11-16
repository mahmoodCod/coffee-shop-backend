const express = require('express');
const path = require('path');
const cors = require('cors');

const authRouter = require('./routes/v1/auth');

const userRouter = require('./routes/v1/user');

const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limits: "30mb" }));
app.use(express.urlencoded({limits: '30mb' ,extended: true}));
app.use(cors());
// app.use(setHeaders);

// Router
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

app.use((req,res) => {
    return res.status(404).json({
        status: 404,
        success: false,
        error: "404! path not found.please double check the path / method"
    });
});

app.use(errorHandler);

module.exports = app;