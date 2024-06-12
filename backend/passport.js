const passport = require("passport");
//google auth
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
//dayjs
const dayjs = require('dayjs')

/* MONGOOSE */
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")
//mongoose findorcreate
const findOrCreate = require('mongoose-findorcreate')

//dotenv for environment variables
require('dotenv').config();

// Define the database URL to connect to.
const dev_db_url = "mongodb://127.0.0.1:27017/chatChirpUserDB"
const mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB);


const SERVER_URL = process.env.SERVER_URL;


const userSchema = new mongoose.Schema ({
    email: { 
      type: String, 
      maxlength: 50, 
      unique: false,
      required: true,
    },
    name: { 
      type: String, 
      maxlength: 30, 
      unique: false,
      required: false,
    },
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
      maxlength: 100
  },
});

/* change the usernameField as passport by default creates a field named "username" by registering a user and checks for it while logging in. we use "name" field for that */
userSchema.plugin(passportLocalMongoose, {usernameField: "email"});
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
      //the "to" array must be bigger than two = a RECEIVER must be selected!
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

/* END OF MONGOOSE */

/* MULTER SETUP (for storing images on db) */
var multer = require('multer');
 
const upload = multer({ dest: 'images/' })

/* END OF MULTER */

passport.use(User.createStrategy());

//google strategy
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



//exporting User and Message models and upload attribute in order to use them in routes.js 
module.exports = { User, Message, upload, passport }

