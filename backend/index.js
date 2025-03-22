//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//import configurations
const { connectDB } = require('./configuration/db');
const passport = require('./configuration/passport');
const sessionConfig = require('./configuration/session');
//import pusher service initialization
const { initializePusherService } = require('./configuration/pusher-service');
//import CORS configuration from centralized file
const { corsMiddleware } = require('./configuration/cors-config');

//import routes
const routes = require("./routes/allRoutes");

//initialize express app
const app = express();

//connect to database
connectDB();

//apply CORS middleware to all routes
app.use(corsMiddleware);

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

//serve static files
app.use('/images', express.static('images'));

app.set('trust proxy', 1); //needed for production

//session and auth setup
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());

//initialize pusher service
//this creates the Pusher client and returns utility functions for real-time messaging
const pusherService = initializePusherService();

//make pusher service available to all route handlers
//this middleware attaches the pusher utilities to the request object
//this allows any route handler to emit events without importing the modules
//important for message and image routes that need to send real-time notifications between users
app.use((req, res, next) => {
  req.pusherService = pusherService; //attach pusher service to all requests
  global.pusherService = pusherService; //make pusher service globally available for auth endpoints
  next();
});

//mount routes
app.use("/", routes);

//start server with express app directly (no HTTP server needed for pusher, unlike socket)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//important for deployment on vercel: export the Express app as default export
module.exports = app;