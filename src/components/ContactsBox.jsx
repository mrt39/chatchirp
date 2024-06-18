/* eslint-disable react/prop-types */
import { useState, useEffect, useContext} from 'react'
import { UserContext } from '../App.jsx';
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  Search,
  ConversationList,
  Sidebar,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/ContactsBox.css'
import MuiAvatar from "./MuiAvatar";




const filterData = (query, contactsBoxPeople) => {
    if (!query) {
      return;
    } else {
      return contactsBoxPeople.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    }
};

const ContactsBox = ({sidebarStyle, messagesBetween, handleConversationClick, messageSent, conversationAvatarStyle, conversationContentStyle, firstMsg, contactsBoxPeople, setContactsBoxPeople}) => {
    
    // Pass the UserContext defined in app.jsx
    const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

    const [loading, setLoading] = useState(true);
    const [searchbarValue, setsearchbarValue] = useState("");
    const [contactsBoxPeopleDisplayed, setcontactsBoxPeopleDisplayed] = useState([]);

    //clicked person fills the "selectedPerson" state
    function handleSelectedPerson(selectedPersonId){
        const foundperson = contactsBoxPeople.find(( person ) => person["_id"] === selectedPersonId);
        setSelectedPerson(foundperson);
    }

    //useffect to populate the contacts box
    useEffect(() => {
        const getContacts = () => {
            fetch(import.meta.env.VITE_BACKEND_URL+'/messagebox/'+ currentUser["_id"]  , {
            method: 'GET',
            })
            .then(response => {
                if (response.ok) {
                return response.json(); // Parse JSON when the response is successful
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                setContactsBoxPeople(data)
                setcontactsBoxPeopleDisplayed(data)
                setLoading(false); // Set loading to false once the data is received
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false); 
            });
        };
        getContacts();
        //add firstMsg as a dependency so that contactsbox refreshes everytime user sends a message to a user for the FIRST time.
        }, [firstMsg]); 

    //useeffect for search function
    useEffect(() => {
        function contactsBoxSearch(){
            if(searchbarValue===""){
                setcontactsBoxPeopleDisplayed(contactsBoxPeople)
            }
            else{
                const dataFiltered = filterData(searchbarValue, contactsBoxPeople);
                setcontactsBoxPeopleDisplayed(dataFiltered)
            }
    }
      // only trigger after the initial loading ends
       if (loading === false){
        contactsBoxSearch();
        }  

    }, [searchbarValue]); 

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
                :""}
            key={person._id} 
            onClick={function()  {handleConversationClick(); handleSelectedPerson(person._id)}}
            >
            {/* use "as="Avatar" attribute because the parent component from chatscope doesn't accept a child that isn't named "Avatar" */}
            <MuiAvatar 
            as="Avatar"
            user={person}/>
            <Conversation.Content name={person.name} info={person.lastMsg.message} style={conversationContentStyle} />
            </Conversation>
            ))
        }

        </ConversationList>
        </Sidebar>
    )
               
}

export default ContactsBox;

