/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from 'react';
import { fetchMessages } from '../utilities/api';
import { extractUniqueDays } from '../utilities/dateUtils';
import { useAuthorization } from './AuthorizationContext';

//context for managing messaging functionality and state
const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { currentUser } = useAuthorization();
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [messagesBetween, setMessagesBetween] = useState([]);
  const [messageDays, setMessageDays] = useState([]);
  const [firstMsg, setFirstMsg] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [imgSubmitted, setImgSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  //handle message fetching with proper cleanup to prevent repeated API calls
  useEffect(() => {
    let isMounted = true;
    //store the current selected person's ID to prevent updates for previous selections
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
        console.error('Error fetching messages:', error);
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
      setMessagesBetween({});
      setMessageDays({});
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedPerson?._id, messageSent, imgSubmitted, currentUser?._id]); // Use IDs instead of objects

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

//custom hook for using message context
export function useMessage() {
  return useContext(MessageContext);
}