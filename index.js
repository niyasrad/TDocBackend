require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const combineRoutes = require('./src/routes');
const combineMiddleware = require('./src/util');
const authMiddleware = require('./src/util/auth');

const app = express();
combineMiddleware(app);
combineRoutes(app);
app.use(authMiddleware);
app.get('/', async(req, res) => {
    res.status(200).json({
        message: "Server Running!"
    });
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
    console.log("Server Listening on port "+PORT+"...")
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Server DB Connection Success!");
    } catch (err) {
        console.log(`Server DB Crashed! Error: ${err.message}`);
    }
})