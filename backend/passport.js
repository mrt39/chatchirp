const passport = require("passport");
//google auth
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//dayjs
const dayjs = require('dayjs')

/* MONGOOSE */
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")
//mongoose findorcreate
const findOrCreate = require('mongoose-findorcreate')

mongoose.connect('mongodb://127.0.0.1:27017/chatChirpUserDB');

const userSchema = new mongoose.Schema ({
    email: String,
    name: String,
    password: {
      type: String,
      unique: false,
      required: false,
  },
    googleId: {
      type: String,
      unique: false,
      required: false,
  },
    /* google pic */
    picture: {
      type: String,
      unique: false,
      required: false,
  },
    /* uploaded pic */
    uploadedpic: {
      type: String,
      unique: false,
      required: false,

  },
    bio: {
      type: String,
      unique: false,
      required: false,

  },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema ({
  from: {type: [userSchema],        
    unique: false,
    required: true, },
  to: {type: [userSchema], 
    unique: false,
    required: true,
    validate: {
    validator: function() {
      /* the "to" array must be bigger than two = a RECEIVER must be selected! */
      return this.to.length > 0;
    },
    message: `The user you're trying to send the message to does not exist.`
  }, },
  date: {
    /* store current date as miliseconds from epoch:
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date */
    type: String,
    default: Date.now
},
  message: {
    type: String,
    unique: false,
    required: false,
},
  image: {
    type: String,
    unique: false,
    required: false,
},
});

const Message = new mongoose.model("Message", messageSchema);

const message1 = new Message({
  from:   {
    "_id" : "655a4e326203a487c40ed833",
    "email": "jtaylor8719@gmail.com",
    "name": "Jared Taylor",
    "googleId": "102024138481994704258",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocJifjrCrE7knHHIMB9bwIzhpTqIOZJ_ZX2ePZ0xZM7U=s96-c",
    "__v": 0
},
  to:  {
    "_id" : "655a4e226203a487c40ed82b",
    "email": "chriscarter19822@gmail.com",
    "name": "Chris Carter",
    "googleId": "108002578840135619377",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocLLPPXlAAwIxKtAaqqquVYMlOR21Tc9frgKGTO1Rilvkg=s96-c",
    "__v": 0
},
  message: "binu to the moon",
});

const message2 = new Message({
  from:  {
    "_id" : "655a4e5b6203a487c40ed855",
    "email": "smugme12@gmail.com",
    "name": "Smug Fe",
    "googleId": "108779567425507695915",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocIR7TIZwAdyJoKClDmmUkoBOEuz9VcZwmxxgd1raTrz=s96-c",
    "__v": 0
},
  to:   {
    "_id" : "655a4e226203a487c40ed82b",
    "email": "chriscarter19822@gmail.com",
    "name": "Chris Carter",
    "googleId": "108002578840135619377",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocLLPPXlAAwIxKtAaqqquVYMlOR21Tc9frgKGTO1Rilvkg=s96-c",
    "__v": 0
},
  message: "wassup mang",
});

const message3 = new Message({
  from:   {
    "_id" : "655a4e376203a487c40ed839",
    "email": "binutokencommunity@gmail.com",
    "name": "Binu Token",
    "googleId": "114949457437636203595",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKCgwq6zZsd1zl4JOYW-BnvYAeR-8FkMyFcfHHZoOvj=s96-c",
    "__v": 0
},
  to:   {
    "_id" : "655a4e226203a487c40ed82b",
    "email": "chriscarter19822@gmail.com",
    "name": "Chris Carter",
    "googleId": "108002578840135619377",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocLLPPXlAAwIxKtAaqqquVYMlOR21Tc9frgKGTO1Rilvkg=s96-c",
    "__v": 0
},
  message: "ayo chris is that you yo",
});


Message.create(message1);
setTimeout(function(){
  Message.create(message2);
}, 100);
setTimeout(function(){
  Message.create(message3);
}, 100);
 

/* END OF MONGOOSE */


/* MULTER SETUP (for storing images on db) */
var multer = require('multer');
 
/* var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
}); */
 
/* var upload = multer({ storage: storage }); */

const upload = multer({ dest: 'images/' })

//exporting User and Message models and upload attribute in order to use them in routes.js 
module.exports = { User, Message, upload }

/* END OF MULTER */



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
async function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    const existingUser = await User.findOne({ googleId: profile.id });
    /* if the user exists with the same id, log in */
    if (existingUser) { 
      done(null, existingUser);
    /* otherwise, create new user */
    } else {
    const user = await new User({ googleId: profile.id, name: profile.displayName, picture: profile["_json"].picture, email: profile["_json"].email  }).save();
      done(null, user);
    }
    }
));


