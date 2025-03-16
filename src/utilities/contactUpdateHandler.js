//utility functions for handling contact updates from socket.io
//these functions manage contact list updates when messages are received
//handles both existing contact updates and new contact creation

import { playNotificationSound } from './soundUtils';

//checks if sender exists in contacts list
//returns the contact object if found, otherwise null
//required for determining if a message is from a new or existing contact
function identifyContact(senderId, contacts) {
  if (!contacts || !senderId) {
    return null;
  }
  
  //convert ID to string for consistent comparison
  //this avoids type coercion issues when comparing IDs
  const senderIdStr = String(senderId);
  return contacts.find(contact => String(contact._id) === senderIdStr) || null;
}

//updates an existing contact with new message info
//handles updating the last message and read/unread status
function updateExistingContact(senderId, message, isActiveContact, updateContactLastMessage) {
  //false indicates it's not from current user
  //isActiveContact determines whether to mark as read or unread
  updateContactLastMessage(senderId, message, false, isActiveContact);
}

//creates a new contact from sender info
//adds a new contact when receiving a message from someone not in contacts
//automatically marks as unread and plays notification sound
function createNewContact(senderInfo, message, addNewContact) {
  if (!senderInfo || !addNewContact) {
    return;
  }
  
  //create a new contact object with unread flag
  //includes sender info plus additional message details
  const newContact = {
    ...senderInfo,
    lastMsg: { message: message },
    unread: true
  };
  
  //add to contacts list
  //this will update the UI and persist to cache
  addNewContact(newContact);
  
  //new contacts always trigger notification
  //alerting user that someone new has messaged them
  playNotificationSound();
}

//main handler function for contact updates
//executes the contact update process based on incoming message data
//this is the primary entry point called by the socket event listener
function handleUpdateContacts(data, context) {
  if (!data) {
    return;
  }
  
  //extract data from the socket event payload
  //break down the data object to different contsants
  const { senderId, message, senderInfo } = data;
  //extract needed context values provided by MessageContext
  //break down the data object to different constants
  const { selectedPerson, contacts, updateContactLastMessage, addNewContact } = context;
  
  if (!senderId) {
    return;
  }
  
  //convert IDs to strings for reliable comparison
  //this avoids type coercion issues when comparing IDs
  const senderIdStr = String(senderId);
  const selectedPersonIdStr = selectedPerson ? String(selectedPerson._id) : null;
  
  //check if this is from the active conversation
  //determines whether to mark as read or unread
  const isActiveConversation = selectedPersonIdStr === senderIdStr;
  
  //determine if this contact is currently in an active conversation
  //used to decide whether to mark message as read automatically
  const isActiveContact = isActiveConversation;
  
  //first check if sender exists in contacts
  //this determines whether to update existing or create new contact
  const existingContact = identifyContact(senderId, contacts);
  
  if (existingContact) {
    //update existing contact
    //handles last message updates and read/unread status
    updateExistingContact(senderId, message, isActiveContact, updateContactLastMessage);
  } else if (senderInfo) {
    //create new contact
    //adds a completely new entry to the contacts list
    createNewContact(senderInfo, message, addNewContact);
  }
}

export {
  identifyContact,
  updateExistingContact,
  createNewContact,
  handleUpdateContacts
};