const router = require("express").Router();
//node file system module
const fs = require('fs');
const path = require('path');
//grab the User model that's exported in passport.js
const {User, Message, upload, passport} = require( "../passport.js")




const CLIENT_URL = process.env.CLIENT_URL;



router.get("/login/success", (req, res) => {
  if (req.isAuthenticated()) {
    //Send user to the frontend
    res.json(req.user);
  } else {
    res.status(401).send('User not authenticated');
  }
});


router.get("/", (req, res) => {
 
    res.send(JSON.stringify("App is Working"));

});

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

router.post("/signup", function(req, res){
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
  })
});


router.post("/login", function(req, res){
  passport.authenticate("local")(req, res, function(){
    console.log("Successfully logged in!")
    res.send(JSON.stringify("Successfully logged in!"))
  })
});



router.post('/logout',  (req, res) => {
  console.log("Logging out user:", req.user);
  if (req.isAuthenticated()) {
    req.logout(function(err) {
      if (err) {
        console.error(err);
        res.status(401).json( 'Not able to logout' );
      }
      console.log("Logged out successfully.");
      res.status(200).json( "Logged out successfully." );
    });
} else {
    res.status(401).json( 'Not able to logout' );
}
});



router.get("/messagebox/:userid", async (req, res) => {

  const userID = req.params.userid // access URL variable
  //in the messagebox, only display users whom the user has at least 1 message between (either sent or received)
  try {
    const messagesFromUser = await Message.find({ 'from.0._id': userID});
    const messagesToUser = await Message.find({ 'to.0._id': userID});
    //extract users from the messages
    const sentTo = await messagesFromUser.map(message => message.to[0])
    const receivedFrom = await messagesToUser.map(message => message.from[0])
    //concat
    const allContacts = sentTo.concat(receivedFrom);
    //filter duplicates
    const uniqueIds = [];
    const uniqueContactsObj = await allContacts.filter(user => {
      const isDuplicate =  uniqueIds.includes(user.email);
      if (!isDuplicate) {
        uniqueIds.push(user.email);
        return true;
      }
      return false;
    });
    //add the "lastMsg" property to the objects within the uniqueContactsObj array, in order to display it in the ContactsBox.
    //however, since it's an array of multiple mongoose objects and mongoose objects doesn't accept adding new properties to them, turn these objects into plain objects, with .toObject() method.
    //https://stackoverflow.com/questions/7503450/how-do-you-turn-a-mongoose-document-into-a-plain-object
    var uniqueContacts = uniqueContactsObj.map(function(model) { return model.toObject(); });

    //replace/populate the user info of the uniqueContacts from the user database, in case the users have changed their name or profile picture
    await uniqueContacts.map(user => {
      User.find({_id: user._id})
        .then( result => {
          const updatedUser = result[0];
          user.name= updatedUser.name;
          user.email= updatedUser.email;
          user.uploadedpic=updatedUser.uploadedpic;
        }
        )
      return user
    });

    
    //between the logged in user and each unique user, find the last message that's sent.
    //use a for loop instead of forEach, because not able to use aysnc (await) in forEach.
    for (let index = 0; index < uniqueContacts.length; index++) { 
      //search by ID because if the users change their name or e-mail later on, their messages won't be found under the same user model
      let messagesFromClickedPerson =  await Message.find({ 'to.0._id': userID , 'from.0._id': uniqueContacts[index]._id.toString()});
      let messagesFromUser1 =  await Message.find({ 'to.0._id': uniqueContacts[index]._id.toString(), 'from.0._id': userID});
      //combine the two arrays
      let allMessagesBetween = messagesFromClickedPerson.concat(messagesFromUser1);
      //select the last message in the array, which will be the last message that's sent and store it into "lastMsg" key value.
      uniqueContacts[index].lastMsg = allMessagesBetween[allMessagesBetween.length - 1]; 
    }

    res.send(uniqueContacts);


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
  
  try {
    //get both messages FROM and TO clicked (selected) person.
    //search by ID because if the users change their name or e-mail later on, their messages won't be found under the same user model
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

  try {
    //send message available only if authenticated
    if (req.isAuthenticated){
      const newMessage = new Message({
          from: req.body.from,
          to: req.body.to,
          message: req.body.message,
      });
      const result = newMessage.save();
      res.send(result)
    } else{
      res.send(JSON.stringify("Not authenticated!"));
    }

  } catch (err) {
      res.send(err);
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
  try {
    user.uploadedpic= imageName
    const result = await user.save();
    console.log("image saved! filename: " +req.file.filename)
    res.send(result)

  }catch (err) {
    res.send(err);
  }

});

//image sent in message input
router.post("/imagesent", upload.single('image'), async (req, res) => {


  console.log(path.join(__dirname + '/../images/' + req.file.filename)) 

  const imageName = req.file.filename 

  const msgFrom = JSON.parse(req.body.from).currentUser
  const msgTo = JSON.parse(req.body.to).selectedPerson


  try {
    if (req.isAuthenticated){
      const newMessage = new Message({
          from: msgFrom,
          to: msgTo,
          image: imageName,
      });
      const result = newMessage.save();
      res.send(result)
    } else{
      res.send(JSON.stringify("Not authenticated!"));
    }

  } catch (err) {
      res.send(err);
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

} catch (err) {
    res.send(err);
}

});


module.exports = router