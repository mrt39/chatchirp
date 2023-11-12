/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback  } from 'react'
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  Search,
  ConversationList,
  Sidebar,
  Conversation,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/ContactsBox.css'




const ContactsBox = ({sidebarStyle, handleConversationClick, conversationAvatarStyle, conversationContentStyle}) => {

    /* Contacts Box (sidebar) Messages */
    const [contactsBoxPeople, setContactsBoxPeople] = useState();
    const [loading, setLoading] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState();


    //clicked person becomes the "selectedPerson" state
    function handleSelectedPerson(selectedPersonId){
        const foundperson = contactsBoxPeople.find(( person ) => person["_id"] === selectedPersonId);
        setSelectedPerson(foundperson);
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
                console.log(contactsBoxPeople)
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
                <div className='circularProgressContainer'>
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress size="5rem" />
                </Box>
                </div>

                :
                contactsBoxPeople.map(({ _id, email, name, picture }) => (
                    <Conversation 
                    className={(selectedPerson["_id"]===_id? "activeContactsBox" :"")}
                    key={_id} 
                    onClick={function()  {handleConversationClick(); handleSelectedPerson(_id)}}
                    lastActivityTime="43 min"
                    >
                    <Avatar  src={picture}  name={name} style={conversationAvatarStyle} />
                    <Conversation.Content name={name} lastSenderName="Lilly" info="Yes i can do it for you" style={conversationContentStyle} />
                    </Conversation>
                    ))
                }
                    
                </ConversationList>
                </Sidebar>)
               
}

export default ContactsBox;