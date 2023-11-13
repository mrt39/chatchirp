/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect, useCallback  } from 'react'
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  Search,
  ConversationList,
  Sidebar,
  Conversation,
  MessageInput,
  MessageGroup,
  Avatar,
  ConversationHeader,
  EllipsisButton,
  TypingIndicator,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import ContactsBox from "./ContactsBox";
import MessageInputBox from "./MessageInputBox.jsx";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/MessageBox.css'


const MessageBox = ({currentUser}) => {

    const [selectedPerson, setSelectedPerson] = useState();
    //messages between user and selected person
    const [messagesBetween, setMessagesBetween] = useState();

    const [loading, setLoading] = useState(true);

    /* message sent from messageinputbox component */
    const [messageSent, setMessageSent] = useState(false)

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [sidebarStyle, setSidebarStyle] = useState({});
    const [chatContainerStyle, setChatContainerStyle] = useState({});
    const [conversationContentStyle, setConversationContentStyle] = useState({});
    const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});

    const handleBackClick = () => setSidebarVisible(!sidebarVisible);

    const handleConversationClick = useCallback(() => {
      if (sidebarVisible) {
        setSidebarVisible(false);
      }
    }, [sidebarVisible, setSidebarVisible]);

    useEffect(() => {
      if (sidebarVisible) {
        setSidebarStyle({
          display: "flex",
          flexBasis: "auto",
          width: "100%",
          maxWidth: "100%"
        });
        setConversationContentStyle({
          display: "flex"
        });
        setConversationAvatarStyle({
          marginRight: "1em"
        });
        setChatContainerStyle({
          display: "none"
        });
      } else {
        setSidebarStyle({});
        setConversationContentStyle({});
        setConversationAvatarStyle({});
        setChatContainerStyle({});
      }
    }, [sidebarVisible, setSidebarVisible, setConversationContentStyle, setConversationAvatarStyle, setSidebarStyle, setChatContainerStyle]);

    /* when selected person changes, set loading state to true */
    useEffect(() => {
      setLoading(true)
    }, [selectedPerson]); 


    /* handling the messages between user and clicked person */
    useEffect(() => {
      const getMessages = () => {
          fetch('http://localhost:5000/messagesfrom/' + currentUser["_id"] + '_' +selectedPerson["_id"]  ,{
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
            setMessagesBetween(data)
            console.log(data)
            setLoading(false); // Set loading to false once the data is received
          })
          .catch(error => {
            console.error('Error:', error);
            setLoading(false); 
          });
      };
      //run when the user clicks on a person 
        if (selectedPerson){
          getMessages();
        }
      }, [selectedPerson, messageSent]); 


    
    return <div style={{ width: "100%"

    }}>
           <MainContainer responsive>                
              
              <ContactsBox
              sidebarStyle = {sidebarStyle}
              handleConversationClick={handleConversationClick}
              conversationAvatarStyle={conversationAvatarStyle}
              conversationContentStyle={conversationContentStyle}
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              />
          {/* display only if user selects a person */}
          {selectedPerson? 
             <ChatContainer style={chatContainerStyle}>

               <ConversationHeader>
                 <ConversationHeader.Back  onClick={handleBackClick}/>
                 <Avatar  src={selectedPerson.picture}  name={selectedPerson.name} />
                 <ConversationHeader.Content userName={selectedPerson.name} info="Active 10 mins ago" />
                 <ConversationHeader.Actions>
                      <EllipsisButton orientation="vertical" />
                 </ConversationHeader.Actions>          
               </ConversationHeader>

            {loading?
              <div className='circularProgressContainer'>
              <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="5rem" />
              </Box>
              </div>
              :
               <MessageList >

                 <MessageList.Content>

                <MessageSeparator content="Saturday, 30 November 2019" />
               {//sort data according to time, in ascending order
              messagesBetween.sort((message1, message2) => (message1.date > message2.date) ? 1 : (message1.date < message2.date) ? -1 : 0)
              .map((message) => (
               <MessageGroup 
               key = {message["_id"]}
                /* "incoming" or "outgoing" */
               direction={(message.from[0]["_id"]===selectedPerson["_id"]? "incoming" :"outgoing")}
               >          
                  <Avatar /* src={joeIco} */ name={"Joe"} />          
                  <MessageGroup.Messages>
                    <Message model={{
                  message: message.message,
                  sentTime: "15 mins ago",
                  sender: "Joe",
                  direction: (message.from[0]["_id"]===selectedPerson["_id"]? "incoming" :"outgoing"),
                  position: "single",
                }} />
                  </MessageGroup.Messages>    
                  <MessageGroup.Footer >23:50</MessageGroup.Footer>          
              </MessageGroup>
               ))
              }


                <MessageInputBox
                currentUser={currentUser}
                selectedPerson={selectedPerson} 
                messageSent={messageSent}   
                setMessageSent={setMessageSent}            
                />
                </MessageList.Content>

               </MessageList>
            }

             </ChatContainer>
        : <p>SELECT A PERSON TO TALK YO!</p> 
        }                         
           </MainContainer>
         </div>;
         }

    
    
export default MessageBox;