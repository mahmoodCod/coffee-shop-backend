const app = require('./app');
const configSwagger = require('./configs/swagger');

configSwagger(app);

const mongoose = require('mongoose');
require("dotenv").config();

const port = process.env.PORT;

(async () => {
    await mongoose.connect(process.env.MONGO_URL);
})();

app.get("/",(req,res) => {
    res.json({ message:"ok" });
});

app.listen(port, () => {
});
