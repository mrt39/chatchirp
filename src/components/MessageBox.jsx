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
import '../styles/MessageBox.css'


const MessageBox = ({currentUser}) => {

    const [selectedPerson, setSelectedPerson] = useState();

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
             
             <ChatContainer style={chatContainerStyle}>
               <ConversationHeader>
                 <ConversationHeader.Back  onClick={handleBackClick}/>
                 <Avatar /* src={zoeIco} */ name="Zoe" />
                 <ConversationHeader.Content userName="Zoe" info="Active 10 mins ago" />
                 <ConversationHeader.Actions>
                      <EllipsisButton orientation="vertical" />
                 </ConversationHeader.Actions>          
               </ConversationHeader>


               <MessageList >

                 <MessageList.Content>

                <MessageSeparator content="Saturday, 30 November 2019" />

               <MessageGroup direction="incoming">          
                  <Avatar /* src={joeIco} */ name={"Joe"} />          
                  <MessageGroup.Messages>
                    <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Joe"
                }} />
                  </MessageGroup.Messages>    
                  <MessageGroup.Footer >23:50</MessageGroup.Footer>          
              </MessageGroup>

                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "single"
                }}>
                          <Avatar /* src={zoeIco}  */name="Zoe" />
                        </Message>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Patrik",
                  direction: "outgoing",
                  position: "single"
                }} avatarSpacer />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "first"
                }} avatarSpacer />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "normal"
                }} avatarSpacer />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "normal"
                }} avatarSpacer />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "last"
                }}>
                          <Avatar/*  src={zoeIco} */ name="Zoe" />
                        </Message>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Patrik",
                  direction: "outgoing",
                  position: "first"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Patrik",
                  direction: "outgoing",
                  position: "normal"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Patrik",
                  direction: "outgoing",
                  position: "normal"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Patrik",
                  direction: "outgoing",
                  position: "last"
                }} />
                        
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "first"
                }} avatarSpacer />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe",
                  direction: "incoming",
                  position: "last"
                }}>
                   <Avatar /* src={zoeIco} */ name="Zoe" />
                 </Message>


                <MessageInputBox
                currentUser={currentUser}
                selectedPerson={selectedPerson}                
                />
                </MessageList.Content>

               </MessageList>


             </ChatContainer>                         
           </MainContainer>
         </div>;
         }

    
    
export default MessageBox;