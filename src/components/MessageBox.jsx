/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { formatMessageTime, isSameDay } from '../utilities/dateUtils';
import { useMessage } from '../contexts/MessageContext';
import { useAuthorization } from '../contexts/AuthorizationContext';

export default function MessageBox() {
  //pass the contexts
  const { currentUser } = useAuthorization();
  const { 
    selectedPerson, 
    setSelectedPerson,
    messagesBetween,
    messageDays,
    loading,
    firstMsg,
    messageSent,
    imgSubmitted
  } = useMessage();

  //users that will be displayed on the contactsbox (populated by fetch within ContactsBox component)
  const [contactsBoxPeople, setContactsBoxPeople] = useState([]);

  //responsive UI states
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});

  //handle back button click in mobile view
  const handleBackClick = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
    setSelectedPerson(null);
  }, [sidebarVisible, setSelectedPerson]);

  //handle conversation click in contact list
  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible]);

  //responsive layout handling
  useEffect(() => {
    if (selectedPerson) {
      setSidebarVisible(false);
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
  }, [sidebarVisible, selectedPerson]);

  //useMemo for sorting messages by date 
  //this prevents re-sorting the entire message array on every render
  //especially valuable when message list is long or when UI state changes frequently
  const sortedMessages = useMemo(() => {
    //only sort when we have messages to sort
    if (!messagesBetween || messagesBetween.length === 0) {
      return [];
    }
    //sort by date in ascending order (oldest to newest)
    //this is computationally expensive with large arrays
    return [...messagesBetween].sort((message1, message2) => 
      (message1.date > message2.date) ? 1 : (message1.date < message2.date) ? -1 : 0
    );
  }, [messagesBetween]); //only recalculate when messagesBetween changes

  //useMemo for generating message content by day
  //this memoizes the complex grouping of messages by day
  //prevents regenerating this structure on every render
  const messagesByDay = useMemo(() => {
    if (!Array.isArray(messageDays) || messageDays.length === 0 || !sortedMessages || sortedMessages.length === 0) {
      return [];
    }

    //create message groups by day (expensive with large message histories)
    return messageDays.map(day => ({
      day,
      messages: sortedMessages.filter(message => isSameDay(day, message.date))
    }));
  }, [messageDays, sortedMessages]); //dependencies, only recalculate when these change

  return (
    <div style={{ width: "100%"}}>
      <MainContainer responsive>                
        <ContactsBox
          sidebarStyle={sidebarStyle}
          handleConversationClick={handleConversationClick}
          conversationAvatarStyle={conversationAvatarStyle}
          conversationContentStyle={conversationContentStyle}
          contactsBoxPeople={contactsBoxPeople} 
          setContactsBoxPeople={setContactsBoxPeople}
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
              <div as="InputToolbox2" className='circularProgressContainer'>
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="5rem" />
                </Box>
              </div>
              :
              <MessageList>
                <MessageList.Content className="messageListContent">
                  {/* Use memoized messagesByDay structure for rendering */}
                  {messagesByDay.map(({ day, messages }) => (
                    <div key={day}>
                      {/* separator for each separate day of messaging */}
                      <MessageSeparator content={day} />            
                      {/* display the day's messages */}
                      {messages.map((message) => (
                        <MessageGroup 
                          key={message._id}
                          direction={(message.to[0]._id === message.from[0]._id ? "outgoing"
                            : (selectedPerson._id === message.from[0]._id ? "incoming" : "outgoing"))}
                        >          
                          <div as="Avatar" className="messageBoxAvatar">
                            <MuiAvatar 
                              user={message.from[0]}/>    
                          </div>     
                          <MessageGroup.Messages>
                            <Message model={{
                              message: message.image ? null : message.message,
                              sender: message.from[0].toString(),
                              direction: (message.to[0]._id === message.from[0]._id ? "outgoing"
                                : (selectedPerson._id === message.from[0]._id ? "incoming" : "outgoing")),
                              position: "single",
                            }}>
                              {message.image &&
                                <Message.ImageContent className="msgBoxImg1" src={message.image} alt="image" />
                              }
                            </Message>
                          </MessageGroup.Messages>    
                          <MessageGroup.Footer>{formatMessageTime(message.date)}</MessageGroup.Footer>          
                        </MessageGroup>
                      ))}
                    </div>
                  ))}
  
                  <MessageInputBox
                    contactsBoxPeople={contactsBoxPeople}  
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