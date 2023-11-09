//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//hashing, cookies 
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")

//google auth
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//mongoose findorcreate
const findOrCreate = require('mongoose-findorcreate')

//cors
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use(session({
    secret: 'secrets',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/chatChirpUserDB');

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());


//passport serialization for authenticationa
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

//google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




app.get("/", (req, res) => {
 
    res.send("App is Working");

});

app.get('/auth/google/', 
  passport.authenticate('google', { scope: ['profile', 'email']}),
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect('/checkifloggedout');
});



app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/checkifloggedout');
      });
});


app.get("/checkifloggedout", function(req, res){
    if (req.isAuthenticated()){
        res.send("You are logged in!");
    }
    else{
        res.send("You are NOT logged in!");
    }
});


app.get("/leaderboard/:scenename", async (req, res) => {

    const sceneName = req.params.scenename // access URL variable

})

 
app.post("/register", async (req, res) => {

    console.log(req.body)
 
});


app.listen(5000);