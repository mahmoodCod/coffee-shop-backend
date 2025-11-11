# تست‌های پروژه

## نصب Dependencies

قبل از اجرای تست‌ها، باید Jest و Supertest را نصب کنید:

```bash
npm install --save-dev jest supertest
```

## اجرای تست‌ها

```bash
# اجرای همه تست‌ها
npm test

# اجرای تست‌ها با watch mode
npm run test:watch

# اجرای تست‌ها با coverage
npm run test:coverage
```

## ساختار تست‌ها

- `tests/app.test.js` - تست‌های Express app configuration

## تست‌های فعلی

### app.test.js
- تست 404 handler برای route های undefined
- تست JSON response
- تست JSON body parser
- تست HTTP methods مختلف (GET, POST, PUT, DELETE)

