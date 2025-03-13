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
//this route handles both saving the image message to the database AND triggering the real-time socket notification to the recipient
router.post("/imagesent", upload.single('image'), async (req, res) => {
  const imageName = req.file.filename;
  // Parse the JSON strings back into objects
  // Images use a different format than text messages
  const msgFrom = JSON.parse(req.body.from).currentUser;
  const msgTo = JSON.parse(req.body.to).selectedPerson;

  try {
    if (req.isAuthenticated) {
      //convert buffer to data URI for cloud upload
      const dataURI = bufferToDataURI(req.file.mimetype, req.file.buffer);
      
      //upload to cloudinary to get a URL
      const uploadResult = await uploadToCloudinary(dataURI, imageName);
      
      //save the image message to the database
      //this is the standard HTTP part of the message flow
      const result = await sendImageMessage(msgFrom, msgTo, uploadResult.secure_url);
      
      //SOCKET.IO REAL-TIME NOTIFICATION LOGIC FOR IMAGES
      //after saving the image message, notify recipient in real-time
      //this works the same way as text messages but with image data
      if (req.socketService) {
        //extract recipient ID with better error handling
        //image messages use a simpler object structure than text messages
        let recipientId = null;
        
        //check for direct object structure
        if (msgTo && msgTo._id) {
          recipientId = msgTo._id;
        }
        
        //if recipient ID found, send socket notifications
        if (recipientId) {
          console.log(`Socket notification being sent to recipient: ${recipientId} for image message`);
          
          //emit the 'new_message' event to recipient with image message data
          //this allows the recipient's UI to update immediately with the new image
          const delivered = req.socketService.emitToUser(recipientId, 'new_message', result);
          console.log(`Socket image delivery status: ${delivered ? 'delivered' : 'not delivered'}`);
          
          //also send an 'update_contacts' event to update the recipient's contacts list
          //we use a special emoji to indicate it's an image message
          req.socketService.emitToUser(recipientId, 'update_contacts', {
            senderId: msgFrom && msgFrom._id,
            message: '📷 Image' //special message for images in contacts list
          });
        } else {
          console.log('Missing recipient ID for image message. Message to:', msgTo);
        }
      }
      
      res.send(result);
    } else {
      res.send(JSON.stringify("Not authenticated!"));
    }
  } catch (err) {
    console.error('Error in imagesent route:', err);
    res.send(err);
  }
});

module.exports = router;