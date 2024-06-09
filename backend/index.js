//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");


//hashing, cookies 
const session = require('express-session');
const {passport} = require( "./passport.js")



//cors
const cors = require("cors");


//require other js files
const authRoute = require("./routes/routes.js");


const app = express();
app.use(
  cors({
    origin: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true,
  })
);


app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

//serve the files in /images folder as static files
app.use('/images', express.static('images'))


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production if served over HTTPS
      sameSite: 'strict' // Optional, set based on your requirements
  }
}));


app.use(passport.initialize());
app.use(passport.session());





/* Mount Routes */

app.use("/", authRoute);



app.listen("5000", () => {
  console.log("Server is running!");
});



