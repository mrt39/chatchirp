const express = require('express');
const router = express.Router();

//main router that combines all routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const messageRoutes = require('./messages');
const imageRoutes = require('./images');

//import CORS middleware
const { ALLOWED_ORIGIN, corsOptions } = require("../configuration/cors-config");
const cors = require("cors");

//apply CORS preflight handling to all routes in this router
router.options("*", cors(corsOptions));
router.use(cors(corsOptions));

//root route
router.get("/", (req, res) => {
    res.send("ChatChirp API is running");
});

//use all route modules
router.use(authRoutes);
router.use(userRoutes);
router.use(messageRoutes);
router.use(imageRoutes);

module.exports = router;