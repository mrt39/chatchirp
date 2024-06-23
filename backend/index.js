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



app.set('trust proxy', 1); //add this for production

//storing session in mongodb because storing it in client is unstable for production
//(works fine for development but starts to randomly log people out in production, when deployed to server)
const MongoDBStore = require('connect-mongodb-session')(session);
const dev_db_url = "mongodb://127.0.0.1:27017/chatChirpUserDB"
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI || dev_db_url,
  collection: 'mySessions'
});

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    proxy: true, //add this for production
    store: store, //store to mongodb
    cookie: {
      secure: true, // Set to true in production if served over HTTPS, "false" for development
      sameSite: 'none' // "none" for production, "strict" for development
  }
}));

app.use(passport.initialize());
app.use(passport.session());



/* Mount Routes */

app.use("/", authRoute);

app.listen("5000", () => {
  console.log("Server is running!");
});





