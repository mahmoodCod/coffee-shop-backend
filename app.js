const express = require('express');
const path = require('path');
const cors = require('cors');
const { setHeaders } = require('./middleware/headers');

const authRouter = require('./routes/v1/auth');
const userRouter = require('./routes/v1/user');
const categoryRouter = require('./routes/v1/category');
const errorHandler = require('./middleware/errorHandler');
const productRouter = require('./routes/v1/product');
const commentRouter = require('./routes/v1/comment');
const orderRouter = require('./routes/v1/order');
const articleRouter = require('./routes/v1/article');
const wishlistRouter = require('./routes/v1/wishlist');
const discountCodeRouter = require('./routes/v1/discountCode');
const valueBuyRouter = require('./routes/v1/valueBuy');

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limits: "30mb" }));
app.use(express.urlencoded({limits: '30mb' ,extended: true}));
app.use(cors());
app.use(setHeaders);

// Health check route - قبل از بقیه routeها
app.get('/', (req, res) => {
    res.json({ 
        message: "Coffee Shop API is running",
        status: "ok",
        endpoints: {
            auth: "/api/v1/auth",
            user: "/api/v1/user",
            category: "/api/v1/category",
            product: "/api/v1/product",
            comment: "/api/v1/comment",
            order: "/api/v1/order",
            article: "/api/v1/article",
            wishlist: "/api/v1/wishlist",
            discountCode: "/api/v1/discountCode",
            valueBuy: "/api/v1/valueBuy",
        },
    });
});

// Router
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/article', articleRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/discountCode', discountCodeRouter);
app.use('/api/v1/valueBuy', valueBuyRouter);
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