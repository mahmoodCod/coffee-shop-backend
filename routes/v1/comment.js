const express = require('express');
const { auth } = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

const router  = express.Router();

router.route('/')
.post(auth, createComment)
.get(getComment);

router.route('/all').get(getAllComments);

router.route('/:commentId')
.delete(auth, roleGuard('ADMIN'), removeComment)
.patch(auth,updateComment);

module.exports = router;