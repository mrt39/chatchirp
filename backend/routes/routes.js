const router = require("express").Router();
const passport = require("passport");
//node file system module
const fs = require('fs');
const path = require('path');
/* grab the User model that's exported in passport.js */
const {User, Message, upload} = require( "../passport.js")

const CLIENT_URL = "http://localhost:5173/";



router.get("/login/success", (req, res) => {
  if (req.isAuthenticated()) {
    //Send it to the frontend
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

router.get("/getallusers", async (req, res) => {

    try {
      const users = await User.find();
      res.send(users);
  
    } catch (err) {
      res.send(err);
    }
  })

router.get("/profile/:userid", async (req, res) => {

     const userID = req.params.userid // access URL variable
   
    try {
      const user = await User.find({_id: userID});
      console.log("changed value of the user: " + user)
      res.send(user);
  
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




//tap into "upload", which we import from passport.js
//this is a middleware function that will accept the image data from the client side form data as long as it's called image (which is exactly what we called it in the react app formData.append("image", file))
router.post('/uploadprofilepic/:userid',  upload.single('image'),  async (req, res) => {

  //once multer has successfully saved the image, we can tap into image data from req.file
  //"req.file.filename" is the filename it's stored with in "images" folder
  console.log(path.join(__dirname + '/../images/' + req.file.filename)) 

  const imageName = req.file.filename 

  const userid = req.params.userid 
  const user = await User.findOne({_id: userid});
  console.log(user)
  try {
    user.uploadedpic= imageName
    const result = await user.save();
    console.log("image saved! filename: " +req.file.filename)
    res.send(result)

  }catch (e) {
    res.send("Something Went Wrong");
  }


});

//image sent in message input
router.post("/imagesent", upload.single('image'), async (req, res) => {

  console.log(path.join(__dirname + '/../images/' + req.file.filename)) 

  const imageName = req.file.filename 

  const msgFrom = JSON.parse(req.body.from).currentUser
  const msgTo = JSON.parse(req.body.to).selectedPerson

  console.log(msgFrom)
  console.log(msgTo)

  try {
    const newMessage = new Message({
        from: msgFrom,
        to: msgTo,
        image: imageName,
    });
    const result = newMessage.save();
    res.send(result)

  } catch (e) {
      res.send("Something Went Wrong");
  }
 
});



/* ROUTE FOR RENDERING THE IMAGES PROPERTY */
router.get('/images/:imageName', (req, res) => {
  const imageName = req.params.imageName
  const readStream = fs.createReadStream(`images/${imageName}`)
  readStream.pipe(res)
})






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