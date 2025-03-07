/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useContext } from 'react'
import { UserContext } from '../contexts/UserContext.jsx';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageGroup,
  ConversationHeader,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import ContactsBox from "./ContactsBox";
import MessageInputBox from "./MessageInputBox.jsx";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/MessageBox.css'
import MuiAvatar from "./MuiAvatar";
import LogoImg from "../assets/logo.png";
import { fetchMessages } from '../utilities/api';
import { 
  formatMessageTime, 
  isSameDay,
  extractUniqueDays
} from '../utilities/format';

const MessageBox = () => {

  //Pass the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  //messages between user and selected person
  const [messagesBetween, setMessagesBetween] = useState({});
  //message days, to categorize the display of message under different days
  const [messageDays, setMessageDays] = useState({});

  const [loading, setLoading] = useState(true);

  //check whether there has been any messaging between the user and selectedperson beforehand (if first message, re-render ContactsBox so new user gets displayed) 
  const [firstMsg, setFirstMsg] = useState(false);

  //Users that will be displayed on the contactsbox (populated by fetch within ContactsBox component)
  const [contactsBoxPeople, setContactsBoxPeople] = useState({});

  //message sent from messageinputbox component
  const [messageSent, setMessageSent] = useState(false)

  //user presses "send" after selecting the image
  const [imgSubmitted, setImgSubmitted] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});

  const handleBackClick = () => {setSidebarVisible(!sidebarVisible);  setSelectedPerson(null)}

  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible, setSidebarVisible]);

  //style the sidebar and conversation bar for lower resolutions
  useEffect(() => {
    
    if(selectedPerson){
      setSidebarVisible(false)
    }

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

//handle message fetching with proper cleanup to prevent repeated API calls
useEffect(() => {
  let isMounted = true;
  //store the current selected person's ID to prevent updates for previous selections
  const currentPersonId = selectedPerson?._id;
  
  async function getMessages() {
    if (!selectedPerson || !currentUser) return;
    
    try {
      //only set loading once at the beginning of the fetch
      if (isMounted && currentPersonId === selectedPerson?._id) {
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
    <div style={{ width: "100%"}}>
      <MainContainer responsive>                
        <ContactsBox
          sidebarStyle={sidebarStyle}
          firstMsg={firstMsg}
          handleConversationClick={handleConversationClick}
          conversationAvatarStyle={conversationAvatarStyle}
          conversationContentStyle={conversationContentStyle}
          contactsBoxPeople={contactsBoxPeople} 
          setContactsBoxPeople={setContactsBoxPeople}
          messageSent={messageSent}
          messagesBetween={messagesBetween}
        />
        {/* display only if user selects a person */}
        {selectedPerson ? 
          <ChatContainer style={chatContainerStyle}>
            <ConversationHeader>
              <ConversationHeader.Back onClick={handleBackClick}/>
              <div as="Avatar" className='messageBoxHeaderAvatar'>
                <MuiAvatar
                  as="Avatar"
                  user={selectedPerson}/> 
              </div> 
              <ConversationHeader.Content userName={selectedPerson.name}/>        
            </ConversationHeader>

            {loading ?
              /* use as="Conversation2" to give the ConversationList component a child component that it allows
              to solve the "div" is not a valid child" error.
              https://chatscope.io/storybook/react/?path=/docs/documentation-recipes--page#changing-component-type-to-allow-place-it-in-container-slot */
              <div as="InputToolbox2" className='circularProgressContainer'>
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="5rem" />
                </Box>
              </div>
              :
              <MessageList>
                <MessageList.Content className="messageListContent">
                  {messageDays.map((day) => (
                    <div key={day}>
                      {/* Produces a separator for each separate day of messaging between the selectedPerson and user */}
                      <MessageSeparator content={day} />            
                      {/* sort data according to time, in ascending order */}
                      {messagesBetween
                        .sort((message1, message2) => (message1.date > message2.date) ? 1 : (message1.date < message2.date) ? -1 : 0)
                        // divide messages into days, display each day under the "day" variable that's mapped above from messageDays
                        .map((message) => (
                          isSameDay(day, message.date) &&
                          <MessageGroup 
                            key={message._id}
                            // if the sender and receiver is the same (user has sent it to themselves, display it as sender)
                            direction={(message.to[0]._id === message.from[0]._id ? "outgoing"
                              // otherwise, sort it out as receiver and sender
                              : 
                              (selectedPerson._id === message.from[0]._id ? "incoming" : "outgoing"))}
                          >          
                            {/* use "as="Avatar" attribute because the parent component from chatscope doesn't accept a child that isn't named "Avatar" */}
                            <div as="Avatar" className="messageBoxAvatar">
                              <MuiAvatar 
                                user={message.from[0]}/>    
                            </div>     
                            <MessageGroup.Messages>
                              <Message model={{
                                // if the message is an image, display image
                                message: message.image ? null : message.message,
                                sender: message.from[0].toString(),
                                // if the sender and receiver is the same (user has sent it to themselves, display it as sender)
                                direction: (message.to[0]._id === message.from[0]._id ? "outgoing"
                                  // otherwise, sort it out as receiver and sender
                                  : 
                                  (selectedPerson._id === message.from[0]._id ? "incoming" : "outgoing")),
                                position: "single",
                              }}>
                                {message.image ?
                                  <Message.ImageContent className="msgBoxImg1" src={message.image} alt="image" />
                                  : null}
                              </Message>
                            </MessageGroup.Messages>    
                            <MessageGroup.Footer>{formatMessageTime(message.date)}</MessageGroup.Footer>          
                          </MessageGroup>
                        ))
                      }
                    </div>
                  ))}

                  <MessageInputBox
                    contactsBoxPeople={contactsBoxPeople} 
                    messageSent={messageSent}   
                    setMessageSent={setMessageSent}
                    firstMsg={firstMsg}
                    setFirstMsg={setFirstMsg}
                    imgSubmitted={imgSubmitted}
                    setImgSubmitted={setImgSubmitted}   
                    setContactsBoxPeople={setContactsBoxPeople}
                  />
                </MessageList.Content>
              </MessageList>
            }
          </ChatContainer>
        : 
        <div className="noPersonSelectedContainer">
          <img src={LogoImg} alt="logo" />
          <p>ChatChirp</p> 
        </div>
        }
      </MainContainer>
    </div>
  );
}

export default MessageBox;