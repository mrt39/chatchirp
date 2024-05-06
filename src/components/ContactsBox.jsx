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




const ContactsBox = ({sidebarStyle, handleConversationClick, messageSent, conversationAvatarStyle, conversationContentStyle, firstMsg, contactsBoxPeople, setContactsBoxPeople}) => {

    const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 


    const [loading, setLoading] = useState(true);



    //clicked person becomes the "selectedPerson" state
    function handleSelectedPerson(selectedPersonId){
        const foundperson = contactsBoxPeople.find(( person ) => person["_id"] === selectedPersonId);
        setSelectedPerson(foundperson);
        console.log(selectedPerson)
    }

    //useffect to populate the contacts box
    useEffect(() => {
        const getContacts = () => {
            fetch('http://localhost:5000/messagebox/'+ currentUser["_id"]  , {
            method: 'GET',
            })
            .then(response => {
                console.log(response)
                if (response.ok) {
                return response.json(); // Parse JSON when the response is successful
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                setContactsBoxPeople(data)
                console.log(data)
                console.log(data[0].lastMsg)
                console.log(data[1].lastMsg)
                console.log(contactsBoxPeople)
                setLoading(false); // Set loading to false once the data is received
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false); 
            });
        };
        getContacts();
        //add firstMsg as a dependency so that contactsbox refreshes everytime user sends a message to a user for the FIRST time.
        //add messageSent as a dependancy so that contactsbox refreshes everytime user sends a message (so that the "lastMsg" changes)
        }, [firstMsg, messageSent]); 

        return (
                <Sidebar position="left"  style={sidebarStyle}>
                <Search placeholder="Search..." />
                <ConversationList>           
                {/* MAP all the conversations */}
                {loading?
                
                /* using as="Conversation2" to give the ConversationList component a child component that it allows
                solving the  "div" is not a valid child" error.
                https://chatscope.io/storybook/react/?path=/docs/documentation-recipes--page#changing-component-type-to-allow-place-it-in-container-slot */
                <div as="Conversation2" className='circularProgressContainer'>
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress size="5rem" />
                </Box>
                </div>
               

                :
                //uniqueContacts property comes from backend; from the object we're sending as a response.
                contactsBoxPeople.map((person) => (
                    <Conversation 
                    /* if there is a selected person, change class to highlight it */
                    className={
                        selectedPerson?
                            (selectedPerson["_id"]===person._id? "activeContactsBox" :"")
                        :""}
                    key={person._id} 
                    onClick={function()  {handleConversationClick(); handleSelectedPerson(person._id)}}
                    lastActivityTime="43 min"
                    >
                    {/* using "as="Avatar" attribute because the parent component from chatscope doesn't accept a child that isn't named "Avatar" */}
                    <MuiAvatar 
                    as="Avatar"
                    user={person}/>
                    <Conversation.Content name={person.name} /* lastSenderName={person.lastMsg.from[0].name} */ info={person.lastMsg.message} style={conversationContentStyle} />
                    </Conversation>
                    ))
                }
                    
                </ConversationList>
                </Sidebar>)
               
}

export default ContactsBox;