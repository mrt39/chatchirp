//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
//require http module to create a server that Socket.io can attach to
//Socket.io needs a raw HTTP server instead of just Express
const http = require('http');

//import configurations
const { connectDB } = require('./configuration/db');
const passport = require('./configuration/passport');
const sessionConfig = require('./configuration/session');
//import socket initialization function
const { initializeSocket } = require('./configuration/socket');

//import routes
const routes = require("./routes/allRoutes");

//initialize express app
const app = express();
//create http server with express app
//Socket.io requires a raw HTTP server to attach to
const server = http.createServer(app);

//connect to database
connectDB();

//initialize socket.io with our HTTP server
//this creates the WebSocket server and returns utility functions that will be used throughout the application for real-time messaging
const socketService = initializeSocket(server);

//middleware
app.use(
  cors({
    origin: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

//serve static files
app.use('/images', express.static('images'));

app.set('trust proxy', 1); //needed for production

//session and auth setup
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());

//make socketService available to all route handlers
//this middleware attaches the socket utilities to the request object
//this allows any route handler to emit socket events without importing the socket module
//important for message and image routes that need to send real-time notifications between users
app.use((req, res, next) => {
  req.socketService = socketService; //attach socket service to all requests
  next();
});

//mount routes
app.use("/", routes);

//start server with http server instead of express app
//Socket.io is attached to this server instance
//so app must start the HTTP server directly rather than the Express app
server.listen("5000", () => {
  console.log("Server is running with Socket.io!");
});