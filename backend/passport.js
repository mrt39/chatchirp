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

const messageSchema = new mongoose.Schema ({
  from: [userSchema],
  to: [userSchema],
  date: {
    type: String,
    default:  new Date()
},
  message: String,
  image: { sparse: true, type: Buffer, contentType: String},
});

const Message = new mongoose.model("Message", messageSchema);

//exporting User and Message models in order to use them in routes.js 
module.exports = { User, Message }

const message1 = new Message({
  from:   {
    "email": "chriscarter19822@gmail.com",
    "password": "String",
    "name": "Chris Carter",
    "googleId": "108002578840135619377",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocLLPPXlAAwIxKtAaqqquVYMlOR21Tc9frgKGTO1Rilvkg=s96-c",
    "__v": 0
},
  to:  {
    "email": "binutokencommunity@gmail.com",
    "password": "String",
    "name": "Binu Token",
    "googleId": "114949457437636203595",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKCgwq6zZsd1zl4JOYW-BnvYAeR-8FkMyFcfHHZoOvj=s96-c",
    "__v": 0
},
  message: "binu to the moon",
});

const message2 = new Message({
  from:  {
    "email": "jtaylor8719@gmail.com",
    "password": "String",
    "name": "Jared Taylor",
    "googleId": "102024138481994704258",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocJifjrCrE7knHHIMB9bwIzhpTqIOZJ_ZX2ePZ0xZM7U=s96-c",
    "__v": 0
},
  to:   {
    "email": "yorutiwa@gmail.com",
    "password": "String",
    "name": "Kingo Disc",
    "googleId": "103839412898420553185",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKfP2_WYhFqUyW6nD56HUBbtXqa5yy0A7O93EjPR2KM=s96-c",
    "__v": 0
},
  message: "wassup mang",
});

const message3 = new Message({
  from:   {
    "email": "binutokencommunity@gmail.com",
    "password": "String",
    "name": "Binu Token",
    "googleId": "114949457437636203595",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKCgwq6zZsd1zl4JOYW-BnvYAeR-8FkMyFcfHHZoOvj=s96-c",
    "__v": 0
},
  to:   {
    "email": "yorutiwa@gmail.com",
    "password": "String",
    "name": "Kingo Disc",
    "googleId": "103839412898420553185",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKfP2_WYhFqUyW6nD56HUBbtXqa5yy0A7O93EjPR2KM=s96-c",
    "__v": 0
},
  message: "ayo yoru is that you yo",
});



const defaultMessages = [message1, message2, message3];


Message.create(message1);
Message.create(message2);
Message.create(message3);



/* END OF MONGOOSE */

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


