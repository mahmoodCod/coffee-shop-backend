const express = require('express');
const { auth } = require('../../middleware/auth');
const { createBankAccount, getAllBankAccount, getOneBankAccount, updateBankAccount, deleteBankAccount } = require('../../controller/v1/bankAccount');

const router = express.Router();

router.route('/')
    .post(auth, createBankAccount)
    .get(getAllBankAccount);// auth

router.route('/:id')
    .get(auth, getOneBankAccount)
    .patch(auth, updateBankAccount)
    .delete(auth, deleteBankAccount);

module.exports = router;