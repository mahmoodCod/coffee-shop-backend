const request = require("supertest");
const app = require("../app");

// Mock models
jest.mock("../model/Cart");
jest.mock("../model/Checkout");
jest.mock("../model/Order");
jest.mock("../model/Product");

// Mock Zarinpal service
jest.mock("../services/zarinpal", () => ({
  createPayment: jest.fn(),
  verifyPayment: jest.fn(),
}));

const Cart = require("../model/Cart");
const Checkout = require("../model/Checkout");
const Order = require("../model/Order");
const Product = require("../model/Product");
const { createPayment, verifyPayment } = require("../services/zarinpal");

describe("Checkout Controller Tests", () => {

  const userMock = {
    _id: "user123",
    phone: "09120000000",
    addresses: [
      { _id: "addr1", city: "Tehran", street: "Test St", postalCode: "12345" }
    ]
  };

  const authToken = "Bearer valid.token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------
  // POST /api/v1/checkout
  // ----------------------------
  describe("POST /api/v1/checkout (Create Checkout)", () => {

    test("should return 401 for no token", async () => {
      const res = await request(app)
        .post("/api/v1/checkout")
        .send({});

      expect(res.status).toBe(401);
    });

    test("should return 400 when cart is empty", async () => {

      Cart.findOne.mockResolvedValueOnce({ items: [] });

      const res = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", authToken)
        .send({
          shippingAddressId: "addr1"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Cart is empty or not found!");
    });

    test("should return 400 when shipping address is invalid", async () => {
      Cart.findOne.mockResolvedValueOnce({
        items: [{ product: { _id: "p1", price: 10000 }, quantity: 1 }]
      });

      const res = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", authToken)
        .send({
          shippingAddressId: "not-valid"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Shipping address is invalid!");
    });

    test("should return 500 if payment authority fails", async () => {

      Cart.findOne.mockResolvedValueOnce({
        items: [
          { product: { _id: "p1", price: 10000 }, quantity: 2 }
        ]
      });

      createPayment.mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", authToken)
        .send({
          shippingAddressId: "addr1"
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create payment.");
    });

    test("should return 201 and create checkout successfully", async () => {

      Cart.findOne.mockResolvedValueOnce({
        items: [
          { product: { _id: "p1", price: 50000 }, quantity: 1 }
        ]
      });

      createPayment.mockResolvedValueOnce({
        authority: "AUTH123",
        paymentUrl: "https://zarinpal.com/pay/AUTH123"
      });

      Checkout.prototype.save = jest.fn();

      const res = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", authToken)
        .send({
          shippingAddressId: "addr1"
        });

      expect(res.status).toBe(201);
      expect(res.body.data.message).toBe("Checkout created successfully!");
      expect(res.body.data.paymentUrl).toContain("AUTH123");
    });

  });

  // ----------------------------
  // GET /api/v1/checkout/verify
  // ----------------------------
  describe("GET /api/v1/checkout/verify", () => {

    test("should return 401 for missing token", async () => {
      const res = await request(app)
        .get("/api/v1/checkout/verify")
        .query({ Authority: "X" });

      expect(res.status).toBe(401);
    });

    test("should return 400 if order already exists", async () => {
      Order.findOne.mockResolvedValueOnce({ id: "existing-order" });

      const res = await request(app)
        .get("/api/v1/checkout/verify")
        .set("Authorization", authToken)
        .query({ Authority: "AUTH1" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Payment already verified!");
    });

    test("should return 404 if checkout not found", async () => {

      Order.findOne.mockResolvedValueOnce(null);
      Checkout.findOne.mockResolvedValueOnce(null);

      const res = await request(app)
        .get("/api/v1/checkout/verify")
        .set("Authorization", authToken)
        .query({ Authority: "AUTH1" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Checkout not found!");
    });

    test("should return 400 if Zarinpal verify fails", async () => {

      Order.findOne.mockResolvedValueOnce(null);
      Checkout.findOne.mockResolvedValueOnce({
        authority: "AUTH1",
        totalPrice: 10000,
        items: []
      });

      verifyPayment.mockResolvedValueOnce({
        data: { code: -1 }
      });

      const res = await request(app)
        .get("/api/v1/checkout/verify")
        .set("Authorization", authToken)
        .query({ Authority: "AUTH1" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Payment not verified!");
    });

    test("should verify payment and create order", async () => {

      Order.findOne.mockResolvedValueOnce(null);

      Checkout.findOne.mockResolvedValueOnce({
        authority: "AUTH1",
        totalPrice: 10000,
        user: "user123",
        items: [
          { product: "p1", quantity: 2 }
        ],
        shippingAddress: { city: "Tehran" },
        deleteOne: jest.fn()
      });

      verifyPayment.mockResolvedValueOnce({
        data: { code: 100 }
      });

      Order.prototype.save = jest.fn();
      Product.findById = jest.fn().mockResolvedValue({
        stock: 10,
        save: jest.fn()
      });

      Cart.findOneAndUpdate = jest.fn();

      const res = await request(app)
        .get("/api/v1/checkout/verify")
        .set("Authorization", authToken)
        .query({ Authority: "AUTH1" });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe("Payment verified successfully!");
    });
  });

});
