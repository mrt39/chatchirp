//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");


//hashing, cookies 
const session = require('express-session');
const passport = require("passport");


//cors
const cors = require("cors");

//require other js files
const passportSetup = require("./passport.js");
const authRoute = require("./routes/routes.js");


const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cors({
    origin: true,
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

/* serve the files in /images folder as static files */
app.use('/images', express.static('images'))


app.use(session({
    secret: 'secrets',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());




/* Routes */

app.use("/", authRoute);


app.listen("5000", () => {
  console.log("Server is running!");
});


