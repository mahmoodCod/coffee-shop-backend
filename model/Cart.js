const { default: mongoose } = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtTimeOfAdding: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [cartItemSchema],
}, { timestamps: true });

cartSchema.virtual("totalPrice").get(function() {
    return this.items.reduce((total, item) => {
        return total + item.priceAtTimeOfAdding * item.quantity;
    }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);