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
router.post("/messagesent", async (req, res) => {
  try {
    //send message available only if authenticated
    if (req.isAuthenticated) {
      const result = await sendMessage(
        req.body.from,
        req.body.to,
        req.body.message
      );
      res.send(result);
    } else {
      res.send(JSON.stringify("Not authenticated!"));
    }
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;