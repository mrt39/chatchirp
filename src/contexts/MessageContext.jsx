/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { fetchMessages } from '../utilities/api';
import { useAuthorization } from './AuthorizationContext';
import { useContacts } from './ContactsContext';
import { onSocketEvent, offSocketEvent } from '../utilities/socketUtilities';
import { formatMessageContent, sanitizeMessage } from '../utilities/textUtils';
import { extractUniqueDays } from '../utilities/dateUtils';
import { playNotificationSound } from '../utilities/soundUtils'; 

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
  
  //track if the page is visible or not (user is on this tab or another tab)
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

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
          setMessagesBetween(data);
          const uniqueDaysArr = extractUniqueDays(data);
          setMessageDays(uniqueDaysArr);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted && currentPersonId === selectedPerson?._id) {
          console.error('Error fetching messages:', error);
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

  //listen for visibility change events to track if the page is visible or in background
  useEffect(() => {
    //function to update visibility state
    function handleVisibilityChange() {
      setIsPageVisible(!document.hidden);
    }
    
    //add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    //cleanup function to remove event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
          //if the message is received (not sent by current user)
          if (isToCurrentUser) {
            const senderId = message.from[0]._id;
            
            //check if the message is from someone other than the currently selected person
            const isFromDifferentPerson = !selectedPerson || selectedPerson._id !== senderId;
            
            //play notification sound in any of these cases:
            //1. message is from someone other than currently selected person
            //2. the page is not visible (user is on another tab/application)
            if (isFromDifferentPerson || !isPageVisible) {
              //play notification sound for messages when appropriate
              playNotificationSound();
            }
            
            //update the message content for real-time display
            if (selectedPerson && selectedPerson._id === message.from[0]._id) {
              //if we're currently viewing a conversation with this sender,
              //add the message to the messages list immediately
              setMessagesBetween(prevMessages => [...prevMessages, message]);
              
              //update message days for proper grouping in the UI
              setMessageDays(extractUniqueDays([...messagesBetween, message]));
            }
            
            //determine if this contact is currently active (selected)
            const isActiveContact = selectedPerson && selectedPerson._id === senderId;
            
            //update the contact list to show the latest message
            //pass isActiveContact to control unread status
            updateContactLastMessage(senderId, message.message || '📷 Image', false, isActiveContact);
          } else {
            //for user's own sent messages in other tabs/devices
            //update message list if viewing the relevant conversation
            if (selectedPerson && selectedPerson._id === message.to[0]._id) {
              setMessagesBetween(prevMessages => [...prevMessages, message]);
              setMessageDays(extractUniqueDays([...messagesBetween, message]));
            }
            
            //update contacts with the latest sent message
            //the third parameter (true) indicates this message is from the current user
            //the fourth parameter (true) doesn't matter for messages from current user
            updateContactLastMessage(message.to[0]._id, message.message || '📷 Image', true, true);
          }
        }
      }
    };
    
    //handler for contact list updates
    //this function is called whenever the server sends an 'update_contacts' event
    //it ensures the contacts list shows the latest message and adds new contacts when needed
    const handleUpdateContacts = ({ senderId, message, senderInfo }) => {
      //determine if this contact is currently active (selected)
      const isActiveContact = selectedPerson && selectedPerson._id === senderId;
      
      //first try to update an existing contact's last message
      //updateContactLastMessage returns true if the contact was found and updated
      //pass isActiveContact to prevent marking as unread if currently viewing this contact
      const wasUpdated = updateContactLastMessage(senderId, message, false, isActiveContact);
      
      //if the contact wasn't found and we should add a new contact
      if (!wasUpdated && senderInfo && addNewContact) {
        //this is a new contact, play notification sound
        //always play for new contacts as they are always important
        playNotificationSound();
        
        //create a new contact object with unread flag set to true
        const newContact = {
          ...senderInfo,
          lastMsg: { message: message },
          unread: true
        };
        
        //add the new contact to the contacts list
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
  }, [currentUser?._id, selectedPerson, updateContactLastMessage, addNewContact, messagesBetween, isPageVisible]);

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