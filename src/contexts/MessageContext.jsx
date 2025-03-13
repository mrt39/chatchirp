/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from 'react';
import { fetchMessages } from '../utilities/api';
import { extractUniqueDays, formatMessageDate } from '../utilities/dateUtils';
import { useAuthorization } from './AuthorizationContext';
import { useContacts } from './ContactsContext'; 
//import socket event utilities for real-time messaging
//this is app listens for new messages in real-time
import { onSocketEvent, offSocketEvent } from '../utilities/socketUtilities';

//context for managing messaging functionality and state
//this context handles both HTTP-based and socket-based messaging
const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { currentUser } = useAuthorization();
  const { updateContactLastMessage } = useContacts();
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
  }, [selectedPerson?._id, messageSent, imgSubmitted, currentUser?._id]); //dependencies that trigger refetch

  // Socket Event Handling for Real-Time Messages
  //this effect sets up and manages socket event listeners for real-time messaging
  //it's the core of instant messaging functionality
  useEffect(() => {
    //only set up listeners if user is authenticated
    if (!currentUser?._id) return;
    
    //handler for new incoming messages
    //this function is called whenever the server sends a 'new_message' event
    //it updates the UI immediately with the new message content
    const handleNewMessage = (message) => {
      //verify message has the necessary structure
      if (message && message.from && message.from[0] && message.to && message.to[0]) {
        //dtermine if this message involves the current user (sent or received)
        const isFromCurrentUser = message.from[0]._id === currentUser._id;
        const isToCurrentUser = message.to[0]._id === currentUser._id;
        
        //process the message if it involves the current user
        //skip messages completely unrelated to the current user
        if (isFromCurrentUser || isToCurrentUser) {
          //check if message belongs to current open conversation
          //this determines whether to update the message list immediately
          if (selectedPerson && 
             (message.from[0]._id === selectedPerson._id || message.to[0]._id === selectedPerson._id)) {
            
            //add the new message to the current conversation
            //this is what updates the UI instantly when a message arrives
            setMessagesBetween(prev => {
              //avoid duplicating messages by checking message IDs
              if (prev.some(msg => msg._id === message._id)) {
                return prev; //return unchanged if message already exists
              }
              
              //add the new message and sort by date
              //this ensures messages always appear in chronological order
              const updated = [...prev, message];
              return updated.sort((a, b) => parseInt(a.date) - parseInt(b.date));
            });
            
            //update message days grouping if needed
            //this ensures messages are properly grouped by date in the UI
            setMessageDays(prev => {
              const messageDate = new Date(parseInt(message.date));
              const formattedDate = messageDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              
              if (!prev.includes(formattedDate)) {
                return [...prev, formattedDate].sort();
              }
              return prev;
            });
          }
          
          //always update the contacts list regardless of if the message is in current conversation
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
        }
      }
    };
    
    //handler for contact list updates
    //this function is called whenever a new message should update the contacts list
    //it ensures the contacts list shows the latest message without requiring a refresh
    const handleUpdateContacts = ({ senderId, message }) => {
      //use the contacts context function to update the last message
      if (updateContactLastMessage) {
        updateContactLastMessage(senderId, message);
      }
    };
    
    //register socket event listeners
    //these connect our handler functions to the socket events
    //which enables real-time updates when messages arrive
    const newMessageRegistered = onSocketEvent('new_message', handleNewMessage);
    const updateContactsRegistered = onSocketEvent('update_contacts', handleUpdateContacts);
    
    //cleanup function to remove event listeners
    return () => {
      offSocketEvent('new_message', handleNewMessage);
      offSocketEvent('update_contacts', handleUpdateContacts);
    };
  }, [currentUser?._id, selectedPerson, updateContactLastMessage]); //dependencies that trigger effect re-run

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