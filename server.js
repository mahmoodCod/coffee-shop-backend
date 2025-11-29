const mongoose = require('mongoose');
require("dotenv").config();

const app = require('./app');
const configSwagger = require('./configs/swagger');

const port = process.env.PORT || 4000;

// Health check باید قبل از app باشه
// پس این رو توی app.js بزار نه اینجا!

(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB متصل شد');
})();

configSwagger(app);

app.listen(port, () => {
    console.log(`سرور در حال اجرا بر روی پورت ${port}`);
});