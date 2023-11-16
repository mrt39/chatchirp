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

router.get("/messagesfrom/:userid_messagingid", async (req, res) => {


     const route = req.params.userid_messagingid // access URL variable
     //id's in the route will be divided by "_", so we are splitting it into two parts
     const ids = route.split('_');
     const userID= ids[0]
     const messagedPersonID= ids[1]
     console.log("User: " + userID + " . Messaged person: " + messagedPersonID )
   
    try {
      const user = await User.find({_id: userID});
      const messagedPerson = await User.find({_id: messagedPersonID});
      //get both messages FROM and TO clicked (selected) person.
      //searching by ID because if the users change their name or e-mail later on, their messages won't be found under the same user model
      const messagesFromClickedPerson = await Message.find({ 'to.0._id': userID , 'from.0._id': messagedPersonID}  );
      const messagesFromUser = await Message.find({ 'to.0._id': messagedPersonID , 'from.0._id': userID});
      //combine the two arrays
      const allMessagesBetween = messagesFromClickedPerson.concat(messagesFromUser);
      //send messages
      console.log(allMessagesBetween)
      res.send(allMessagesBetween);
  
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

/* A PATCH ROUTE */
router.patch("/editprofile/:userid", async (req, res) => {

  
  const userid = req.params.userid // access URL variable
  const user = await User.findOne({_id: userid});

  console.log(req.body.name + " is the new name for this user: " + user.name)
  try {
    user.name= req.body.name
    user.email= req.body.email
    user.bio= req.body.bio
   
    const result = await user.save();
    res.send(result)

} catch (e) {
    res.send("Something Went Wrong");
}

});


module.exports = router