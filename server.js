const app = require('./app');

const mongoose = require('mongoose');
require("dotenv").config();

const port = process.env.PORT;

(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('mongodb connected');
})();

app.get("/",(req,res) => {
    console.log("Token => ", req.header("authorization").split(" ")[1]);
    res.json({ message:"ok" });
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
