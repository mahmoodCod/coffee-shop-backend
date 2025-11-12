const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

const router = express.Router();

router.route('/').get(auth, roleGuard('ADMIN'), getAll);
router.route('/ban/:userId').post(auth,roleGuard('ADMIN'),banUser);

module.exports = router;