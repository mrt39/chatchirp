/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react';
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
import { fetchContacts } from '../utilities/api';
import { useMessage } from '../contexts/MessageContext';
import { useAuthorization } from '../contexts/AuthorizationContext';

//filter contacts based on search query
function filterData(query, contactsBoxPeople) {
  if (!query) {
    return contactsBoxPeople;
  } else {
    return contactsBoxPeople.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  }
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
  const { selectedPerson, setSelectedPerson, firstMsg } = useMessage();

  const [loading, setLoading] = useState(true);
  const [searchbarValue, setsearchbarValue] = useState("");
  const [contactsBoxPeopleDisplayed, setcontactsBoxPeopleDisplayed] = useState([]);

  //clicked person fills the "selectedPerson" state
  function handleSelectedPerson(selectedPersonId){
    const foundperson = contactsBoxPeople.find(person => person["_id"] === selectedPersonId);
    setSelectedPerson(foundperson);
  }

  //useffect to populate the contacts box
  useEffect(() => {
    async function getContacts() {
      try {
        const data = await fetchContacts(currentUser["_id"]);
        setContactsBoxPeople(data);
        setcontactsBoxPeopleDisplayed(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }
    
    getContacts();
    //add firstMsg as a dependency so that contactsbox refreshes everytime user sends a message to a user for the FIRST time.
  }, [firstMsg]); 

  //using the useMemo React hook to memoize (cache) expensive calculations so they're not re-run unnecessarily
  //here, code memoizes the filtered contacts result to avoid filtering on every render
  //this is especially valuable when there are  many contacts or when the component re-renders frequently
  //useMemo only recalculates this value when searchbarValue or contactsBoxPeople changes
  const filteredContacts = useMemo(() => {
    //this calculation logic only runs when dependencies change, not on every render
    //prevents unnecessary filtering operations as the user types or when other state changes
    if(searchbarValue === "") {
      return contactsBoxPeople; //return all contacts if search is empty
    } else {
      //only apply the expensive filter operation when necessary
      return filterData(searchbarValue, contactsBoxPeople);
    }
  }, [searchbarValue, contactsBoxPeople]); //dependencies - only recalculate if these values change

  //useeffect for search function - now using memoized filtered contacts
  useEffect(() => {
    //only trigger after the initial loading ends
    if (loading === false){
      //use the memoized result instead of calculating it again
      setcontactsBoxPeopleDisplayed(filteredContacts);
    }
  }, [filteredContacts, loading]); 

  return (
    <Sidebar position="left"  style={sidebarStyle}>
      <Search placeholder="Search..." 
              value={searchbarValue}
              onChange={(v) => setsearchbarValue(v)}
      />
      <ConversationList>           
        {/* MAP all the conversations */}
        {loading?
          /* use as="Conversation2" to give the ConversationList component a child component that it allows.
          this solves he  "div" is not a valid child" error.
          https://chatscope.io/storybook/react/?path=/docs/documentation-recipes--page#changing-component-type-to-allow-place-it-in-container-slot */
          <div as="Conversation2" className='circularProgressContainer'>
            <Box sx={{ display: 'flex' }}>
              <CircularProgress size="5rem" />
            </Box>
          </div>
          :
          contactsBoxPeopleDisplayed.map((person) => (
            <Conversation 
              //if there is a selected person, change class to highlight it
              className={
                selectedPerson?
                  (selectedPerson["_id"]===person._id? "activeContactsBox" :"")
                :""
              }
              key={person._id} 
              onClick={function() {handleConversationClick(); handleSelectedPerson(person._id)}}
            >
              {/* use "as="Avatar" attribute because the parent component from chatscope doesn't accept a child that isn't named "Avatar" */}
              <MuiAvatar 
                as="Avatar"
                user={person}
              />
              <Conversation.Content name={person.name} info={person.lastMsg.message} style={conversationContentStyle} />
            </Conversation>
          ))
        }
      </ConversationList>
    </Sidebar>
  );
}