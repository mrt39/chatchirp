//context for managing contacts data with optimized API calls and caching
import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { fetchContacts } from '../utilities/api';
import { useAuthorization } from './AuthorizationContext';
import { cacheContacts, getCachedContacts } from '../utilities/storageUtils';

//create the context
const ContactsContext = createContext();

export function ContactsProvider({ children }) {
  const { currentUser } = useAuthorization();
  
  //state for contacts data
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  
  //useref to track fetch status to prevent duplicate API calls
  //using refs here because:
  //- it will persist between renders without triggering re-renders when modified
  //- it will store contacts objects with multiple properties
  //- its values are accessible synchronously within callbacks and effects
  const requestStateRef = useRef({
    inProgress: false, //tracks if a fetch is currently in progress
    initialized: false, //tracks if contacts have been loaded at least once in this session
    requestId: 0, //used to handle race conditions between multiple API calls
    lastFetchTime: 0 //timestamp of last successful fetch for potential time-based optimizations
  });

  //useCallback ensures this function maintains the same reference between renders
  //without useCallback, it would create a new function instance on every render, causing infinite effect loops
  const fetchContactsList = useCallback(async (forceRefresh = false) => {
    //return early if no user is logged in
    if (!currentUser?._id) return;
    
    //prevent duplicate simultaneous requests
    if (requestStateRef.current.inProgress) {
      return;
    }
    
    //check if we should use cached data
    //this implements a sophisticated multi-level caching strategy
    if (!forceRefresh) {
      //if already initialized and we have contacts, don't fetch again
      //this optimization prevents API calls when data is already available in memory
      if (requestStateRef.current.initialized && contacts.length > 0) {
        return;
      }
      
      //try to get from cache if not forcing refresh
      //checks browser sessionStorage for cached contacts data
      //using the function from storageUtils.js
      const cachedData = getCachedContacts(currentUser._id);
      if (cachedData && cachedData.length > 0) {
        setContacts(cachedData); //update state with cached data
        requestStateRef.current.initialized = true; //mark as initialized to prevent future fetches
        return; //exit without making API call
      }
    }
    
    //mark request as in progress to prevent duplicate calls
    //this flag blocks other calls to this function
    requestStateRef.current.inProgress = true;
    //generate and store unique ID for this request
    //used later to handle multiple requests
    const currentRequestId = ++requestStateRef.current.requestId;
    setContactsLoading(true); //activate loading indicator
    
    try {
      //make the API request to fetch contacts
      const data = await fetchContacts(currentUser._id);
      
      //only update state if this is still the current request
      //prevents older requests that complete late from overwriting newer data
      if (currentRequestId === requestStateRef.current.requestId) {
        setContacts(data); //update state with API response
        requestStateRef.current.initialized = true; //mark as initialized
        requestStateRef.current.lastFetchTime = Date.now(); //record fetch time
        
        //cache the results for future use
        //this enables the cache-first strategy for subsequent requests
        //and maintains data between page navigations without API calls
        cacheContacts(currentUser._id, data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      //only update loading state if this is still the current request
      //ensures loading indicators are properly managed even with concurrent requests
      if (currentRequestId === requestStateRef.current.requestId) {
        setContactsLoading(false);
        requestStateRef.current.inProgress = false;
      }
    }
  }, [currentUser?._id, contacts.length]); //dependencies that trigger function recreation

  //update an existing contact's last message without API call
  function updateContactLastMessage(contactId, newMessage) {
    setContacts(prevContacts => {
      //map through all contacts and update the matching one's lastMsg property
      //this creates a new array with all contacts having the same values except the target contact
      const updatedContacts = prevContacts.map(contact => 
        contact._id === contactId 
          ? { ...contact, lastMsg: { ...contact.lastMsg, message: newMessage } }
          : contact
      );
      
      //update the cache to persist the last message change between page refreshes
      if (currentUser?._id) {
        cacheContacts(currentUser._id, updatedContacts);
      }
      
      //return the updated contacts array to update the react state
      return updatedContacts;
    });
  }

  //add a new contact to the list without making an API call
  //required when sending first message to a new contact
  //provides immediate UI update without sending an API call
  function addNewContact(newContact) {
    setContacts(prevContacts => {
      //check if contact already exists to prevent dupilcates
      const exists = prevContacts.some(contact => contact._id === newContact._id);
      
      if (!exists) {
        //add to end of list
        const updatedContacts = [
          ...prevContacts, 
          //ensure contact has a valid lastMsg property to prevent UI errors
          //creates a new object that preserves all original properties and guarantees lastMsg property exists
          {
            ...newContact, 
            //if lastMsg doesn't exist or is incomplete, provide an empty message
            //this prevents "undefined" errors when ContactsBox tries to display message content
            lastMsg: newContact.lastMsg || { message: "" }
          }
        ];
        
        //update the cache to persist the new contact between page refreshes
        //this ensures the contact remains visible even after page reload by storing the updated contacts list in sessionStorage
        if (currentUser?._id) {
          //use the cacheContacts utility to store the updated list
          cacheContacts(currentUser._id, updatedContacts);
        }
        
        return updatedContacts;
      }
      
      return prevContacts;
    });
  }

  //trigger initial contacts fetch when user logs in
  //this effect runs once when the component mounts or when user changes
  useEffect(() => {
    //only fetch if we have a user and contacts haven't been initialized
    //this condition prevents unnecessary API calls on component re-renders
    //and ensures data is only loaded once per session unless refreshed
    if (currentUser?._id && !requestStateRef.current.initialized) {
      fetchContactsList();
    }
    
    //cleanup function resets state when user logs out
    return () => {
      if (!currentUser) {
        requestStateRef.current.initialized = false;
        requestStateRef.current.inProgress = false;
      }
    };
  }, [currentUser?._id, fetchContactsList]); //dependencies that trigger effect re-run

  const contextValue = {
    contacts,
    setContacts,
    contactsLoading,
    fetchContactsList,
    updateContactLastMessage,
    addNewContact
  };

  return (
    <ContactsContext.Provider value={contextValue}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  return useContext(ContactsContext);
}