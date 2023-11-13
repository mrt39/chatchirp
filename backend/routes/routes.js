const router = require("express").Router();
const passport = require("passport");
/* grab the User model that's exported in passport.js */
const {User, Message} = require( "../passport.js")

const CLIENT_URL = "http://localhost:5173/";



router.get("/login/success", (req, res) => {
  if (req.isAuthenticated()) {
    //Send it  to the frontend
    res.json(req.user);
  } else {
    res.status(401).send('User not authenticated');
  }
});


router.get("/", (req, res) => {
 
    res.send("App is Working");

});

router.get('/auth/google/', 
  passport.authenticate('google', { scope: ['profile', 'email']}),
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect('/checkifloggedout');
});



router.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/checkifloggedout');
      });
});


router.get("/checkifloggedout", function(req, res){
    if (req.isAuthenticated()){
        res.redirect(CLIENT_URL);
    }
    else{
        res.send("You are NOT logged in!");
    }
});

router.get("/messagebox", async (req, res) => {

/*   const sceneName = req.params.scenename // access URL variable
 */
  try {
    const users = await User.find();
    res.send(users);

  } catch (err) {
    res.send(err);
  }
})


 
router.post("/messagesent", async (req, res) => {

    console.log(req.body)
    try {
      const newMessage = new Message({
          from: req.body.from,
          to: req.body.to,
          message: req.body.message,
      });
      const result = newMessage.save();
      res.send(result)

  } catch (e) {
      res.send("Something Went Wrong");
  }
 
});


module.exports = router