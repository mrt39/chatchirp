//authentication routes
const router = require("express").Router();
const passport = require("../configuration/passport");
const { signupUser, loginUser, logoutUser, getCurrentUser } = require('../utilities/authUtilities');
require('dotenv').config();

const CLIENT_URL = process.env.CLIENT_URL;

//check if user is logged in
router.get("/login/success", getCurrentUser);

//google auth routes
router.get('/auth/google/', 
  passport.authenticate('google', { scope: ['profile', 'email']}),
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    if (req.isAuthenticated()){
      res.redirect(CLIENT_URL);
    }
    else{
        res.send(JSON.stringify("Google login failed!"))
    }
});

//signup route
router.post("/signup", signupUser);

//login route
router.post("/login", loginUser);

//logout route
router.post('/logout', logoutUser);

module.exports = router;