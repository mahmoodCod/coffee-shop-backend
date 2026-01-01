const express = require('express');
const { auth } = require('../../middleware/auth');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../../controller/v1/wishlist');

const router = express.Router();

router.post("/", auth, addToWishlist)
.get("/", auth, getWishlist);

router.delete("/:id", auth, removeFromWishlist);

module.exports = router;