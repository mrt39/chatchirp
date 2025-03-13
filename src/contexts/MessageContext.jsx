/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from 'react';
import { fetchMessages } from '../utilities/api';
import { extractUniqueDays, formatMessageDate } from '../utilities/dateUtils';
import { useAuthorization } from './AuthorizationContext';
import { useContacts } from './ContactsContext'; 
//import socket event utilities for real-time messaging
//this is how app listens for new messages in real-time
import { onSocketEvent, offSocketEvent } from '../utilities/socketUtilities';

//context for managing messaging functionality and state
//this context handles both HTTP-based and socket-based messaging
const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { currentUser } = useAuthorization();
  //use the contacts context to update contact list in real-time
  const { updateContactLastMessage, addNewContact } = useContacts();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [messagesBetween, setMessagesBetween] = useState([]);
  const [messageDays, setMessageDays] = useState([]);
  const [firstMsg, setFirstMsg] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [imgSubmitted, setImgSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  //handle message fetching with proper cleanup to prevent repeated API calls
  //this effect loads messages when a conversation is selected
  useEffect(() => {
    let isMounted = true;
    //store the current selected person's ID to prevent updates for previous selections
    //this is required when switching between conversations rapidly
    const currentPersonId = selectedPerson?._id;
    
    async function getMessages() {
      if (!selectedPerson || !currentUser) return;
      
      try {
        //only set loading when initially fetching or changing contacts, not when sending a message
        if (isMounted && currentPersonId === selectedPerson?._id && !messagesBetween.length) {
          setLoading(true);
        }
        
        const data = await fetchMessages(currentUser._id, selectedPerson._id);
        
        //only update state if component is still mounted AND we're still viewing the same person
        if (isMounted && currentPersonId === selectedPerson?._id) {
          //handle duplicate messages (when a user messages themselves)
          if (data[0] && data[0].from[0].email === data[0].to[0].email) {
            const uniqueIds = [];
            const unique = data.filter(element => {
              const isDuplicate = uniqueIds.includes(element._id);
              if (!isDuplicate) {
                uniqueIds.push(element._id);
                return true;
              }
              return false;
            });
            setMessagesBetween(unique);
          } else {
            setMessagesBetween(data);
          }
          
          setMessageDays(extractUniqueDays(data));
          setLoading(false);
        }
      } catch (error) {
        if (isMounted && currentPersonId === selectedPerson?._id) {
          setLoading(false);
        }
      }
    }
    
    //only fetch messages when we have a selected person
    if (selectedPerson) {
      getMessages();
    } else {
      //reset message states when no person is selected
      setMessagesBetween([]);
      setMessageDays([]);
    }
    
    return () => {
      isMounted = false; //cleanup to prevent state updates after unmount
    };
  }, [selectedPerson?._id, messageSent, imgSubmitted, currentUser?._id]);

  //Socket Event Handling for Real-Time Messages
  //this effect sets up and manages socket event listeners for real-time messaging
  //it's the core of what makes messages appear instantly without page refresh
  useEffect(() => {
    //only set up listeners if user is authenticated
    if (!currentUser?._id) return;
    
    //handler for new incoming messages
    //this function is called whenever the server sends a 'new_message' event
    //it updates the UI immediately with the new message content
    const handleNewMessage = (message) => {
      //verify message has the necessary structure before processing
      if (message && message.from && message.from[0] && message.to && message.to[0]) {
        //determine if this message involves the current user (sent or received)
        const isFromCurrentUser = message.from[0]._id === currentUser._id;
        const isToCurrentUser = message.to[0]._id === currentUser._id;
        
        //process the message if it involves the current user
        if (isFromCurrentUser || isToCurrentUser) {
          //check if the message is relevant to the currently viewed conversation
          //this determines whether to update the message list immediately
          const otherPersonId = isFromCurrentUser ? message.to[0]._id : message.from[0]._id;
          const isCurrentConversation = selectedPerson && selectedPerson._id === otherPersonId;
          
          //if we're currently viewing the conversation this message belongs to,
          //add it to the messagesBetween state to update the UI instantly
          if (isCurrentConversation) {
            setMessagesBetween(prevMessages => {
              //only add if it's not already in the list (prevent duplicates)
              const messageExists = prevMessages.some(m => m._id === message._id);
              if (!messageExists) {
                //create a new array to trigger state update and re-render
                const newMessages = [...prevMessages, message];
                
                //also update the message days for proper date separators
                setMessageDays(extractUniqueDays(newMessages));
                
                return newMessages;
              }
              return prevMessages;
            });
          } else {
            //message is for a different conversation than the one currently viewed
          }
          
          //always update the contacts list regardless of whether message is in current conversation
          //this ensures the contact list shows latest messages even if user isn't viewing that conversation
          if (updateContactLastMessage) {
            //if current user sent the message, update the recipient in contacts
            //if current user received the message, update the sender in contacts
            if (isFromCurrentUser) {
              updateContactLastMessage(message.to[0]._id, message.message || '📷 Image');
            } else {
              updateContactLastMessage(message.from[0]._id, message.message || '📷 Image');
            }
          }
        } else {
          //message doesn't involve current user, ignoring
        }
      }
    };
    
    //handler for contact list updates
    //this function is called whenever the server sends an 'update_contacts' event
    //it ensures the contacts list shows the latest message and adds new contacts when needed
    const handleUpdateContacts = ({ senderId, message, senderInfo }) => {
      //first try to update an existing contact's last message
      //updateContactLastMessage returns true if the contact was found and updated
      const wasUpdated = updateContactLastMessage(senderId, message);
      
      //if the contact wasn't found (this is a new contact) and we have sender info,
      //add the sender as a new contact to the contacts list
      //this handles the case of receiving a message from someone not in user's contacts
      if (!wasUpdated && senderInfo && addNewContact) {
        //create a new contact object with the sender info and last message
        //this ensures the new contact appears in the UI with the proper structure
        const newContact = {
          ...senderInfo,
          lastMsg: { message: message }
        };
        
        //add the new contact to the contacts list
        //this will update the UI immediately to show the new conversation
        addNewContact(newContact);
      }
    };
    
    //register socket event listeners
    //these connect our handler functions to the socket events, enabling real-time updates when messages arrive
    const newMessageRegistered = onSocketEvent('new_message', handleNewMessage);
    const updateContactsRegistered = onSocketEvent('update_contacts', handleUpdateContacts);
    
    //cleanup function to remove event listeners
    //this prevents memory leaks and duplicate handlers when component unmounts
    return () => {
      offSocketEvent('new_message', handleNewMessage);
      offSocketEvent('update_contacts', handleUpdateContacts);
    };
  }, [currentUser?._id, selectedPerson, updateContactLastMessage, addNewContact]);

  return (
    <MessageContext.Provider
      value={{
        selectedPerson,
        setSelectedPerson,
        messagesBetween,
        setMessagesBetween,
        messageDays,
        firstMsg,
        setFirstMsg,
        messageSent,
        setMessageSent,
        imgSubmitted,
        setImgSubmitted,
        loading
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(MessageContext);
}