//message routes
const router = require("express").Router();
const { isAuthenticated } = require('../utilities/authUtilities');
const { 
  getMessageBox, 
  getMessagesBetween, 
  sendMessage 
} = require('../utilities/messageUtilities');

//get user message box (conversations)
router.get("/messagebox/:userid", async (req, res) => {
  const userID = req.params.userid;
  try {
    const uniqueContacts = await getMessageBox(userID);
    res.send(uniqueContacts);
  } catch (err) {
    res.send(err);
  }
});

//get messages between two users
router.get("/messagesfrom/:userid_messagingid", async (req, res) => {
  const route = req.params.userid_messagingid;
  const ids = route.split('_');
  const userID = ids[0];
  const messagedPersonID = ids[1];
  
  try {
    const allMessagesBetween = await getMessagesBetween(userID, messagedPersonID);
    res.send(allMessagesBetween);
  } catch (err) {
    res.send(err);
  }
});

//send a message
//this route handles both saving the message to the database AND
//triggering the real-time socket notification to the recipient
router.post("/messagesent", async (req, res) => {
  try {
    //send message available only if authenticated
    if (req.isAuthenticated) {
      //debug the actual structure of req.body
      //this helps identify the format of incoming message data, which can vary based on how the client sends it
      console.log("Message request body structure:", {
        fromStructure: req.body.from ? typeof req.body.from : 'undefined',
        toStructure: req.body.to ? typeof req.body.to : 'undefined',
        fromId: req.body.from && req.body.from._id ? req.body.from._id : 'missing',
        toId: req.body.to && req.body.to._id ? req.body.to._id : 'missing'
      });
      
      //save the message to the database through our message utility
      //this is the standard HTTP part of the message flow
      const result = await sendMessage(
        req.body.from,
        req.body.to,
        req.body.message
      );
      
      //SOCKET.IO REAL-TIME NOTIFICATION LOGIC
      //after saving the message to the database, notify the recipient in real-time
      //this is where the magic of instant messaging happens
      if (req.socketService) {
        //extract recipient ID
        //the flexibility here is crucial because message objects can have different formats
        //depending on how they were constructed by the client
        let recipientId = null;
        
        //check for array structure first (original expected format)
        //this handles the case where 'to' is an array of user objects
        if (req.body.to && Array.isArray(req.body.to) && req.body.to[0] && req.body.to[0]._id) {
          recipientId = req.body.to[0]._id;
        } 
        //check for direct object structure
        //this handles the case where 'to' is a single user object
        else if (req.body.to && req.body.to._id) {
          recipientId = req.body.to._id;
        }
        //check if the result from database has the recipient info
        //fallback if the request body doesn't have properly structured recipient info
        else if (result && result.to && result.to[0] && result.to[0]._id) {
          recipientId = result.to[0]._id;
        }
        
        //if we successfully extracted a recipient ID, send the socket notification
        if (recipientId) {
          console.log(`Socket notification being sent to recipient: ${recipientId}`);
          
          //emit the 'new_message' event to the recipient with the full message data
          //this allows the recipient's UI to update immediately with the new message
          const delivered = req.socketService.emitToUser(recipientId, 'new_message', result);
          console.log(`Socket message delivery status: ${delivered ? 'delivered' : 'not delivered'}`);
          
          //get sender ID with similar flexibility to recipient ID extraction
          let senderId = null;
          let senderInfo = null;
          
          //extract sender information using various possible formats
          if (req.body.from && Array.isArray(req.body.from) && req.body.from[0]) {
            senderId = req.body.from[0]._id;
            senderInfo = req.body.from[0];
          } else if (req.body.from && req.body.from._id) {
            senderId = req.body.from._id;
            senderInfo = req.body.from;
          } else if (result && result.from && result.from[0]) {
            senderId = result.from[0]._id;
            senderInfo = result.from[0];
          }
          
          //also send an 'update_contacts' event to update the recipient's contacts list
          //this ensures the latest message appears in their conversation list
          if (senderId) {
            //enhanced update_contacts event that includes complete sender information
            //this allows the frontend to add new contacts without an API call when receiving a message from someone not in the contacts list
            req.socketService.emitToUser(recipientId, 'update_contacts', {
              senderId: senderId,
              message: req.body.message,
              //include complete sender info needed to create a new contact if needed
              senderInfo: {
                _id: senderId,
                name: senderInfo.name || "Unknown",
                email: senderInfo.email || "",
                uploadedpic: senderInfo.uploadedpic || null,
                picture: senderInfo.picture || null
              }
            });
          }
        } else {
          console.log('Missing recipient ID, cannot send socket notification. Request body:', req.body);
        }
      } else {
        console.log('Socket service not available');
      }
      
      res.send(result);
    } else {
      res.send(JSON.stringify("Not authenticated!"));
    }
  } catch (err) {
    console.error('Error in messagesent route:', err);
    res.send(err);
  }
});

module.exports = router;