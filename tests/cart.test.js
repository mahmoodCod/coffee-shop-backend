const request = require('supertest');
const app = require('../app'); // مسیر به app اصلی
const { default: mongoose } = require('mongoose');

describe('Cart Controller Tests', () => {
  let userToken; // اینجا می‌تونی JWT تستی قرار بدی
  let testProductId;

  beforeAll(async () => {
    // ایجاد اتصال به دیتابیس تستی
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useUnifiedTopology: true });

    // نمونه محصول برای تست
    const Product = require('../model/Product');
    const product = await Product.create({ name: 'Test Product', price: 100 });
    testProductId = product._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/v1/cart - should return empty cart initially', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.cart.items).toHaveLength(0);
    expect(res.body.cart.totalPrice).toBe(0);
  });

  test('POST /api/v1/cart/items - should add product to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: testProductId, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  test('PUT /api/v1/cart/items - should update quantity', async () => {
    const res = await request(app)
      .put('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: testProductId, quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(5);
  });

  test('DELETE /api/v1/cart/items - should remove product from cart', async () => {
    const res = await request(app)
      .delete('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: testProductId });

    expect(res.status).toBe(200);
    expect(res.body.cart.items).toHaveLength(0);
  });

  test('DELETE /api/v1/cart/clear - should clear cart', async () => {
    // اضافه کردن دوباره محصول
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: testProductId, quantity: 3 });

    const res = await request(app)
      .delete('/api/v1/cart/clear')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.cart.items).toHaveLength(0);
    expect(res.body.cart.totalPrice).toBe(0);
  });
});
