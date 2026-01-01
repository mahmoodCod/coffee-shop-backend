const { default: mongoose } = require("mongoose");

const checkoutItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    priceAtTimeOfPurchase: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const checkoutAddressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    items: [checkoutItemSchema],

    shippingAddress: {
        type: checkoutAddressSchema,
        required: true,
    },

    authority: {
        type: String,
        unique: true,
        required: true,
    },

    discountCode: {
        type: String,
        default: null,
    },

    discount: {
        percentage: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
    },

    totalPriceAfterDiscount: {
        type: Number,
        default: 0,
    },

    expiresAt: {
        type: Date,
        required: true,
        default: () => Date.now() + 30 * 60 * 1000, // 30 دقیقه
    },
}, { timestamps: true });

checkoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

checkoutSchema.virtual("totalPrice").get(function () {
    return this.items.reduce((total, item) => {
        return total + item.priceAtTimeOfPurchase * item.quantity;
    }, 0);
});

module.exports = mongoose.model('Checkout', checkoutSchema);