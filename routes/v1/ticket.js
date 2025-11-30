const express = require('express');
const { auth } = require('../../middleware/auth');
const { createTicket, getAllTicket, getOneTicket, updateTicket, deleteTicket, getMyTickets, replyTicket, closeTicket } = require('../../controller/v1/ticket');
const roleGuard = require('../../middleware/roleGuard');

const router = express.Router();

router.route('/')
    .post(auth, createTicket)
    .get(getAllTicket); // admin

router.route('/:id')
    .get(auth, getOneTicket)
    .patch(auth, updateTicket)
    .delete(auth,roleGuard('ADMIN'), deleteTicket);

router.get('/user/my-tickets', auth, getMyTickets);

router.post('/:id/reply', auth, roleGuard('ADMIN'), replyTicket);

router.patch('/:id/close', auth, roleGuard('ADMIN'), closeTicket);

module.exports = router;