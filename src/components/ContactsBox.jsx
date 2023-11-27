/* eslint-disable react/prop-types */
import { useState, useEffect} from 'react'
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  Search,
  ConversationList,
  Sidebar,
  Conversation,
  Loader,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/ContactsBox.css'
import MuiAvatar from "./MuiAvatar";




const ContactsBox = ({sidebarStyle, handleConversationClick, conversationAvatarStyle, conversationContentStyle, selectedPerson, setSelectedPerson}) => {

    /* Contacts Box (sidebar) Messages */
    const [contactsBoxPeople, setContactsBoxPeople] = useState();
    const [loading, setLoading] = useState(true);



    //clicked person becomes the "selectedPerson" state
    function handleSelectedPerson(selectedPersonId){
        const foundperson = contactsBoxPeople.find(( person ) => person["_id"] === selectedPersonId);
        setSelectedPerson(foundperson);
        console.log(selectedPerson)
    }


    useEffect(() => {
        const getMessages = () => {
            fetch('http://localhost:5000/messagebox', {
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
                setLoading(false); // Set loading to false once the data is received
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false); 
            });
        };
        getMessages();
        }, []); 

        return (
                <Sidebar position="left" scrollable={false} style={sidebarStyle}>
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
                    <MuiAvatar 
                    as="Avatar"
                    user={person}/>
                    <Conversation.Content name={person.name} lastSenderName="Lilly" info="Yes i can do it for you" style={conversationContentStyle} />
                    </Conversation>
                    ))
                }
                    
                </ConversationList>
                </Sidebar>)
               
}

export default ContactsBox;