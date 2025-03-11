//image upload routes
const router = require("express").Router();
const upload = require('../configuration/multer');
const { isAuthenticated } = require('../utilities/authUtilities');
const { bufferToDataURI, uploadToCloudinary } = require('../utilities/imageUtilities');
const { updateProfilePicture } = require('../utilities/userUtilities');
const { sendImageMessage } = require('../utilities/messageUtilities');

//upload profile picture
router.post('/uploadprofilepic/:userid', upload.single('image'), async (req, res) => {
  const imageName = req.file.filename;
  const userid = req.params.userid;

  try {
    //convert buffer to data URI
    const dataURI = bufferToDataURI(req.file.mimetype, req.file.buffer);
    
    //upload to cloudinary
    const uploadResult = await uploadToCloudinary(dataURI, imageName);
    
    //update user profile
    const result = await updateProfilePicture(userid, uploadResult.secure_url);
    
    console.log("image saved! filename: " + req.file.filename);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

//send image in a message
router.post("/imagesent", upload.single('image'), async (req, res) => {
  const imageName = req.file.filename;
  const msgFrom = JSON.parse(req.body.from).currentUser;
  const msgTo = JSON.parse(req.body.to).selectedPerson;

  try {
    if (req.isAuthenticated) {
      //convert buffer to data URI
      const dataURI = bufferToDataURI(req.file.mimetype, req.file.buffer);
      
      //upload to cloudinary
      const uploadResult = await uploadToCloudinary(dataURI, imageName);
      
      //send message with image
      const result = await sendImageMessage(msgFrom, msgTo, uploadResult.secure_url);
      
      res.send(result);
    } else {
      res.send(JSON.stringify("Not authenticated!"));
    }
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;