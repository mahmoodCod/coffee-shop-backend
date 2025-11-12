const express = require('express');
const path = require('path');
const cors = require('cors');

const authRouter = require('./routes/v1/auth');

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limits: "30mb" }));
app.use(express.urlencoded({limits: '30mb' ,extended: true}));
app.use(cors());
// app.use(setHeaders);

// Router
app.use('/api/v1/auth', authRouter);


app.use((req,res) => {
    console.log('This path is not found :', req.path);

    return res.status(404).json({
        message: "404! path not found.please double check the path / method"
    });
});

// app.use(errorHandler);

module.exports = app;