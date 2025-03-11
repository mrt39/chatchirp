//models file containing user and message schemas
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

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

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const User = mongoose.models.users || mongoose.model("users", userSchema);

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

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Message = mongoose.models.messages || mongoose.model("messages", messageSchema);

module.exports = { User, Message, userSchema, messageSchema };