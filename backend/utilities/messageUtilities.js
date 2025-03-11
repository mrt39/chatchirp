//message related utility functions
const { User, Message } = require('../models/models');

//get message box for user (conversations)
const getMessageBox = async (userId) => {
  //get messages sent by user
  const messagesFromUser = await Message.find({ 'from.0._id': userId});
  //get messages sent to user
  const messagesToUser = await Message.find({ 'to.0._id': userId});
  
  //extract users from the messages
  const sentTo = messagesFromUser.map(message => message.to[0]);
  const receivedFrom = messagesToUser.map(message => message.from[0]);
  
  //combine all contacts
  const allContacts = sentTo.concat(receivedFrom);
  
  //filter duplicates
  const uniqueIds = [];
  const uniqueContactsObj = allContacts.filter(user => {
    const isDuplicate = uniqueIds.includes(user.email);
    if (!isDuplicate) {
      uniqueIds.push(user.email);
      return true;
    }
    return false;
  });
  
  //convert mongoose objects to plain objects
  var uniqueContacts = uniqueContactsObj.map(model => model.toObject());
  
  //update user info with latest data from user collection
  await Promise.all(uniqueContacts.map(async user => {
    const updatedUser = await User.findById(user._id);
    if (updatedUser) {
      user.name = updatedUser.name;
      user.email = updatedUser.email;
      user.uploadedpic = updatedUser.uploadedpic;
    }
    return user;
  }));
  
  //find latest message between users
  for (let index = 0; index < uniqueContacts.length; index++) { 
    //get messages in both directions
    let messagesFromContact = await Message.find({ 'to.0._id': userId, 'from.0._id': uniqueContacts[index]._id.toString() });
    let messagesFromUser = await Message.find({ 'to.0._id': uniqueContacts[index]._id.toString(), 'from.0._id': userId });
    
    //combine and sort
    let allMessagesBetween = messagesFromContact.concat(messagesFromUser);
    allMessagesBetween.sort((a, b) => a.date > b.date ? 1 : -1);
    
    //get the last message
    uniqueContacts[index].lastMsg = allMessagesBetween[allMessagesBetween.length - 1];
  }
  
  return uniqueContacts;
};

//get messages between two users
const getMessagesBetween = async (userId, otherUserId) => {
  //get messages in both directions
  const messagesFromOther = await Message.find({ 'to.0._id': userId, 'from.0._id': otherUserId });
  const messagesFromUser = await Message.find({ 'to.0._id': otherUserId, 'from.0._id': userId });
  
  //combine messages
  return messagesFromOther.concat(messagesFromUser);
};

//send a text message
const sendMessage = async (from, to, messageText) => {
  const newMessage = new Message({
    from: from,
    to: to,
    message: messageText,
  });
  
  return await newMessage.save();
};

//send an image message
const sendImageMessage = async (from, to, imageUrl) => {
  const newMessage = new Message({
    from: from,
    to: to,
    image: imageUrl,
  });
  
  return await newMessage.save();
};

module.exports = {
  getMessageBox,
  getMessagesBetween,
  sendMessage,
  sendImageMessage
};