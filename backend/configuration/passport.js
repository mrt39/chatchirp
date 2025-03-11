//passport authentication configuration
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { User } = require("../models/models");
require('dotenv').config();

const SERVER_URL = process.env.SERVER_URL;

//configure passport with google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: SERVER_URL+"/auth/google/callback",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
},
async function(accessToken, refreshToken, profile, done) {
  const existingUser = await User.findOne({ googleId: profile.id });
  //if the user exists with the same id, log in
  if (existingUser) { 
    done(null, existingUser);
  //otherwise, create new user
  } else {
  const user = await new User({ googleId: profile.id, name: profile.displayName, picture: profile["_json"].picture, email: profile["_json"].email  }).save();
    done(null, user);
  }
  }
));

//configure local strategy
passport.use(User.createStrategy());

// Serialize User to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize User from session
passport.deserializeUser((id, done) => {
  User.findById(id)
      .then(user => {
          done(null, user);
      })
      .catch(err => {
          done(err, null);
      });
});

module.exports = passport;