//authentication related utility functions
const { User } = require('../models/models');
const passport = require('../configuration/passport');

//check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json('Not authenticated');
};

//handle user signup
const signupUser = async (req, res) => {
  User.register({name: req.body.name, email:req.body.email}, req.body.password, function(err){
    if(err){
        console.log(err);
        res.send(JSON.stringify(err))
    } else {
        passport.authenticate("local")(req, res, function(){
          console.log("Successfully signed up!")
          res.send(JSON.stringify("Successfully signed up!")) 
        });
    }
  });
};

//handle user login
const loginUser = (req, res) => {
  passport.authenticate("local")(req, res, function(){
    console.log("Successfully logged in!")
    res.send(JSON.stringify("Successfully logged in!"))
  });
};

//handle user logout
const logoutUser = (req, res) => {
  console.log("Logging out user:", req.user);
  if (req.isAuthenticated()) {
    req.logout(function(err) {
      if (err) {
        console.error(err);
        res.status(401).json('Not able to logout');
      }
      console.log("Logged out successfully.");
      res.status(200).json("Logged out successfully.");
    });
  } else {
      res.status(401).json('Not able to logout');
  }
};

//get current authenticated user
const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).send('User not authenticated');
  }
};

module.exports = {
  isAuthenticated,
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser
};