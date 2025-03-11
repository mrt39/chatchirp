//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//import configurations
const { connectDB } = require('./configuration/db');
const passport = require('./configuration/passport');
const sessionConfig = require('./configuration/session');

//import routes
const routes = require("./routes/allRoutes"); //import centralized routes

//initialize express app
const app = express();

//connect to database
connectDB();

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

//mount routes
app.use("/", routes);

//start server
app.listen("5000", () => {
  console.log("Server is running!");
});