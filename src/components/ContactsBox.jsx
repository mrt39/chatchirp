/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  Search,
  ConversationList,
  Sidebar,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/ContactsBox.css';
import MuiAvatar from "./MuiAvatar";
import { useMessage } from '../contexts/MessageContext';
import { useAuthorization } from '../contexts/AuthorizationContext';
import { useContacts } from '../contexts/ContactsContext'; //import the contacts context
import { sanitizeMessage, decodeHtmlEntities } from '../utilities/textUtils'; // Import sanitizeMessage and new decodeHtmlEntities function

//filter contacts based on search query
function filterData(query, contactsBoxPeople) {
  if (!query) {
    return contactsBoxPeople;
  } else {
    return contactsBoxPeople.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  }
}

//prepare message text for display as lastMsg - handles all cases with HTML entities and whitespace
//the problem solved here is when the message last sent has leading or trailing whitespaces (like " fish" and "fish " or just consists of whitespaces,
//the lastMsg tends to show the "nbsp" entity instead of whitespace, thus showing unintended html display. 
function prepareMessageForDisplay(message) {
  if (!message) return "";
  
  //first decode any HTML entities that might be in the message
  const decoded = decodeHtmlEntities(message);
  
  //then sanitize to handle whitespace properly
  return sanitizeMessage(decoded) || "";
}

export default function ContactsBox({
  sidebarStyle, 
  handleConversationClick, 
  conversationAvatarStyle, 
  conversationContentStyle,
  contactsBoxPeople, 
  setContactsBoxPeople
}) {
  //use contexts instead of passing UserContext
  const { currentUser } = useAuthorization();  
  const { selectedPerson, setSelectedPerson } = useMessage();
  //use the contacts context instead of messageContext for contacts data
  //includes hasEmptyContacts to properly handle users with no contacts
  const { contacts, contactsLoading, hasEmptyContacts, fetchContactsList, requestStateRef, markContactAsRead } = useContacts();

  const [searchbarValue, setsearchbarValue] = useState("");
  const [contactsBoxPeopleDisplayed, setcontactsBoxPeopleDisplayed] = useState([]);
  //local loading state independent of context loading state
  //this gives more control over the UI loading indicator, preventing flicker when context state changes
  //and allows for a smoother transition between loading states
  const [localLoading, setLocalLoading] = useState(true);

  //clicked person fills the "selectedPerson" state
  function handleSelectedPerson(selectedPersonId){
    const foundperson = contactsBoxPeople.find(person => person["_id"] === selectedPersonId);
    setSelectedPerson(foundperson);
    
    //mark contact as read when selected
    markContactAsRead(selectedPersonId);
  }

  //this useffect coordinates contactslist loading based on multiple conditions
  //it's for preventing unnecessary API calls to fetch the contactslist
  useEffect(() => {
    //only fetch if we have a user but no contacts yet AND we're not already loading
    //checking contactsLoading ensures we don't start multiple simultaneous requests
    //also checks for empty contacts state to prevent unnecessary fetching
    if (currentUser?._id && contacts.length === 0 && !contactsLoading && 
        !requestStateRef.current.emptyResponseReceived && !hasEmptyContacts) {
      fetchContactsList();
    }
    
    //set local loading state based on context loading state and contacts availability
    //this two-part logic provides a smoother UI experience than directly using contactsLoading
    //handles empty contacts as a completed loading state to stop loading indicator
    if (contacts.length > 0 || hasEmptyContacts || 
        (!contactsLoading && requestStateRef.current?.initialized)) {
      setLocalLoading(false);
    } else {
      setLocalLoading(contactsLoading);
    }
  }, [currentUser, contacts.length, contactsLoading, fetchContactsList, requestStateRef, hasEmptyContacts]);

  //update local state from context-provided contacts
  //this effect keeps the component's local state in sync with the context
  //necessary for having consistent data without unnecessary API calls
  useEffect(() => {
    if (contacts.length > 0) {
      setContactsBoxPeople(contacts);
      setcontactsBoxPeopleDisplayed(contacts);
    }
  }, [contacts, setContactsBoxPeople]);

  //useeffect for search function
  useEffect(() => {
    //only update display when there are contacts to display
    if (contactsBoxPeople.length > 0) {
      if (searchbarValue === "") {
        setcontactsBoxPeopleDisplayed(contactsBoxPeople);
      } else {
        setcontactsBoxPeopleDisplayed(filterData(searchbarValue, contactsBoxPeople));
      }
    }
  }, [searchbarValue, contactsBoxPeople]); 

  return (
    <Sidebar position="left" style={sidebarStyle}>
      <Search placeholder="Search..." 
              value={searchbarValue}
              onChange={(v) => setsearchbarValue(v)}
      />
      <ConversationList>           
        {/* MAP all the conversations */}
        {localLoading ?
          /* use as="Conversation2" to give the ConversationList component a child component that it allows.
          this solves he  "div" is not a valid child" error.
          https://chatscope.io/storybook/react/?path=/docs/documentation-recipes--page#changing-component-type-to-allow-place-it-in-container-slot */
          <div as="Conversation2" className='circularProgressContainer'>
            <Box sx={{ display: 'flex' }}>
              <CircularProgress size="5rem" />
            </Box>
          </div>
          :
          contactsBoxPeopleDisplayed.length > 0 ?
            contactsBoxPeopleDisplayed.map((person) => (
              <Conversation 
                //determine the appropriate class based on selection and unread status
                className={
                  selectedPerson ?
                    (selectedPerson["_id"] === person._id ? "activeContactsBox" : 
                     (person.unread ? "unreadContactsBox" : ""))
                  : (person.unread ? "unreadContactsBox" : "")
                }
                key={person._id} 
                onClick={function() {handleConversationClick(); handleSelectedPerson(person._id)}}
              >
                {/* use "as="Avatar" attribute because the parent component from chatscope doesn't accept a child that isn't named "Avatar" */}
                <MuiAvatar 
                  as="Avatar"
                  user={person}
                />
                {/* added null safety check for lastMsg.message (with the question mark "?") with fallback to empty string
                    This prevents rendering errors if the lastMsg object is incomplete */}
                <Conversation.Content 
                  name={person.name} 
                  //if the lastMsg is an image, display "📷 Image" in the contactsbox as the last message
                  info={person.lastMsg?.image != null ? "📷 Image" 
                  //otherwise (if it's a text, display the text using our enhanced preparation function)
                  : prepareMessageForDisplay(person.lastMsg?.message)} 
                  style={conversationContentStyle} 
                />
              </Conversation>
            ))
          : 
          // display "no contacts" message with action link instead constant loading spinner
          <div as="Conversation2" className='noContactsMessage'>
            <p>No contacts yet.</p>
            <Link to="/findpeople" className="findPeopleLink">
              Find people to chat with!
            </Link>
          </div>
        }
      </ConversationList>
    </Sidebar>
  );
}