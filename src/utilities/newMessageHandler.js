//utility functions for handling new message events from socket.io
//these functions manage the processing, validation, and UI updates when new messages arrive

import { playNotificationSound } from './soundUtils';
import { extractUniqueDays } from './dateUtils';

//validates that a message has the required structure, ensures the message has all necessary fields before processing
function validateMessage(message) {
  return message && 
         message.from && 
         message.from[0] && 
         message.to && 
         message.to[0];
}

//processes message based on whether it's from or to the current user
//determines message direction and extracts relevant IDs for further processing
//returns null if the message doesn't involve the current user
function processUserMessage(message, currentUser, selectedPerson) {
  const isFromCurrentUser = message.from[0]._id === currentUser._id;
  const isToCurrentUser = message.to[0]._id === currentUser._id;
  
  //only process messages that involve the current user
  //this prevents handling messages that aren't relevant to this client
  if (!isFromCurrentUser && !isToCurrentUser) {
    return null;
  }
  
  return {
    isFromCurrentUser,
    isToCurrentUser,
    senderId: isToCurrentUser ? message.from[0]._id : message.to[0]._id,
    senderIdStr: isToCurrentUser ? String(message.from[0]._id) : String(message.to[0]._id),
    selectedPersonIdStr: selectedPerson ? String(selectedPerson._id) : null
  };
}

//updates the UI if the conversation is currently active
//adds new messages to the current conversation view and updates day groupings
//only updates UI if the message belongs to the currently selected conversation
function updateConversationUI(message, selectedPerson, messagesBetween, setMessagesBetween, setMessageDays) {
  //check if the conversation with the message sender is currently active
  //this prevents updating UI for conversations not currently in view
  if (selectedPerson) {
    const isActive = (message.to[0]._id === selectedPerson._id) || 
                     (message.from[0]._id === selectedPerson._id);
    
    if (isActive) {
      //add new message to the conversation
      //create a new array to trigger React state updates
      const updatedMessages = [...messagesBetween, message];
      setMessagesBetween(updatedMessages);
      //recalculate message days for proper grouping
      //this ensures messages are organized by date correctly
      setMessageDays(extractUniqueDays(updatedMessages));
    }
  }
}

//determines if notification sound should be played
//plays sound for incoming messages when they're not from the active conversation
//or when the browser tab is not visible to alert the user
function handleNotifications(isActiveConversation, isToCurrentUser, isPageVisible) {
  //play sound only when:
  //1. NOT from active conversation OR
  //2. Page is not visible (tab in background)
  //this ensures users are alerted to new messages appropriately
  if (isToCurrentUser && (!isActiveConversation || !isPageVisible)) {
    playNotificationSound();
    return true;
  }
  return false;
}

//main handler function for new messages
//orchestrates the entire message handling process
//this is the primary entry point called by the socket event listener
function handleNewMessage(message, context) {
  //extract needed values from context
  //these are passed from the MessageContext component
  const { 
    currentUser, 
    selectedPerson, 
    updateContactLastMessage, 
    setMessagesBetween,
    setMessageDays,
    messagesBetween,
    isPageVisible 
  } = context;
  
  //verify message structure
  //return early if message doesn't have required fields
  if (!validateMessage(message)) {
    return;
  }
  
  //process message details
  //extract directional information and relevant IDs
  const processedMessage = processUserMessage(message, currentUser, selectedPerson);
  if (!processedMessage) {
    return;
  }
  
  const { 
    isFromCurrentUser, 
    isToCurrentUser, 
    senderId, 
    senderIdStr,
    selectedPersonIdStr 
  } = processedMessage;
  
  //check if this is from the active conversation
  //used to determine if UI updates and notifications are needed
  const isActiveConversation = selectedPersonIdStr === senderIdStr;
  
  //handle notifications
  //play sound if needed based on message source and app visibility
  handleNotifications(isActiveConversation, isToCurrentUser, isPageVisible);
  
  //update conversation UI if relevant
  //add message to view if conversation is active
  updateConversationUI(message, selectedPerson, messagesBetween, setMessagesBetween, setMessageDays);
  
  //update contact's last message
  //ensures the contacts list shows the most recent message
  if (isToCurrentUser) {
    //received message - update contact with appropriate unread status
    //mark as unread if not from the active conversation
    updateContactLastMessage(senderId, message.message || '📷 Image', false, isActiveConversation);
  } else if (isFromCurrentUser) {
    //sent message - update recipient contact
    //never mark as unread since it was sent by current user
    if (selectedPerson && selectedPerson._id === message.to[0]._id) {
      updateContactLastMessage(message.to[0]._id, message.message || '📷 Image', true, true);
    }
  }
}

export { 
  validateMessage,
  processUserMessage,
  updateConversationUI,
  handleNotifications,
  handleNewMessage
};