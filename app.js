const express = require('express');
const path = require('path');
const cors = require('cors');

const authRouter = require('./routes/v1/auth');
const userRouter = require('./routes/v1/user');
const categoryRouter = require('./routes/v1/category');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limits: "30mb" }));
app.use(express.urlencoded({limits: '30mb' ,extended: true}));
app.use(cors());

// Health check route - قبل از بقیه routeها
app.get('/', (req, res) => {
    res.json({ 
        message: "Coffee Shop API is running",
        status: "ok",
        endpoints: {
            auth: "/api/v1/auth",
            user: "/api/v1/user",
            category: "/api/v1/category",
        },
    });
});

// Router
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/category', categoryRouter);

// 404 handler - این باید آخرین route باشه
app.use((req,res) => {
    console.log('This path is not found :', req.path);
    return res.status(404).json({
        message: "404! path not found.please double check the path / method",
        requestedPath: req.path
    });
});

app.use(errorHandler);

module.exports = app;