const express = require('express');
const { searchProducts } = require('../../controller/v1/search');
const router = express.Router();

router.get('/search', searchProducts);

module.exports = router;
