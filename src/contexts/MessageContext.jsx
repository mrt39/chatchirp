/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { fetchMessages } from '../utilities/api';
import { useAuthorization } from './AuthorizationContext';
import { useContacts } from './ContactsContext';
import { onSocketEvent, offSocketEvent } from '../utilities/socketUtilities';
import { formatMessageContent, sanitizeMessage } from '../utilities/textUtils';
import { extractUniqueDays } from '../utilities/dateUtils';
import { playNotificationSound } from '../utilities/soundUtils'; //import sound utility
import { handleNewMessage } from '../utilities/newMessageHandler';
import { handleUpdateContacts } from '../utilities/contactUpdateHandler';

//context for managing messaging functionality and state
//this context handles both HTTP-based and socket-based messaging
const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { currentUser } = useAuthorization();
  //use the contacts context to update contact list in real-time
  const { updateContactLastMessage, addNewContact, contacts } = useContacts();
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
    
    //create message handler with context
    const messageHandler = (message) => {
      handleNewMessage(message, {
        currentUser,
        selectedPerson,
        updateContactLastMessage,
        setMessagesBetween,
        setMessageDays,
        messagesBetween,
        isPageVisible
      });
    };

    //create contacts update handler with context
    const contactsHandler = (data) => {
      handleUpdateContacts(data, {
        selectedPerson,
        contacts,
        updateContactLastMessage,
        addNewContact
      });
    };
    
    //register socket event listeners
    //these connect our handler functions to the socket events, enabling real-time updates when messages arrive
    const newMessageRegistered = onSocketEvent('new_message', messageHandler);
    const updateContactsRegistered = onSocketEvent('update_contacts', contactsHandler);
    
    //cleanup function to remove event listeners
    //this prevents memory leaks and duplicate handlers when component unmounts
    return () => {
      offSocketEvent('new_message', messageHandler);
      offSocketEvent('update_contacts', contactsHandler);
    };
  }, [currentUser?._id, selectedPerson, updateContactLastMessage, addNewContact, messagesBetween, isPageVisible, contacts]);

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