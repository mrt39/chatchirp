const passport = require("passport");
//google auth
const GoogleStrategy = require('passport-google-oauth20').Strategy;


/* MONGOOSE */
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")
//mongoose findorcreate
const findOrCreate = require('mongoose-findorcreate')

mongoose.connect('mongodb://127.0.0.1:27017/chatChirpUserDB');

const userSchema = new mongoose.Schema ({
    email: String,
    name: String,
    password: String,
    googleId: String,
    picture: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
//exporting User in order to use it in routes.js 
module.exports = { User }

passport.use(User.createStrategy());


//passport serialization for authenticationa
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, user);
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
    User.findOrCreate({ googleId: profile.id, name: profile.displayName, picture: profile["_json"].picture, email: profile["_json"].email  }, function (err, user) {
      return cb(err, user);
    });
  }
));


