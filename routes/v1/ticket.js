const express = require('express');
const { auth } = require('../../middleware/auth');
const { createTicket, getAllTicket, getOneTicket, updateTicket, deleteTicket } = require('../../controller/v1/ticket');

const router = express.Router();

router.route('/')
    .post(auth, createTicket)
    .get(auth, getAllTicket);

router.route('/:id')
    .get(auth, getOneTicket)
    .patch(auth, updateTicket)
    .delete(auth, deleteTicket);

module.exports = router;