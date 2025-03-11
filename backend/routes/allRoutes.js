//main router that combines all routes
const router = require("express").Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const messageRoutes = require('./messages');
const imageRoutes = require('./images');

//root route
router.get("/", (req, res) => {
    res.send("App is Working");
});

//use all route modules
router.use(authRoutes);
router.use(userRoutes);
router.use(messageRoutes);
router.use(imageRoutes);

module.exports = router;