const express = require('express');

const router = express.Router();

router.post('/send', send);
router.post('/verify', verify);
router.get('/me', getMe);

module.exports = router;