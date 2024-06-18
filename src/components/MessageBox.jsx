/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useContext  } from 'react'
import { UserContext } from '../App.jsx';
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
import dayjs from 'dayjs'
import MuiAvatar from "./MuiAvatar";

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

  //when selected person changes, set loading state to true
  useEffect(() => {
    setLoading(true)
  }, [selectedPerson]); 

  //handle fetching the messages between user and clicked person
  useEffect(() => {
    const getMessages = () => {
        fetch(import.meta.env.VITE_BACKEND_URL+'/messagesfrom/' + currentUser["_id"] + '_' +selectedPerson["_id"]  ,{
        method: 'GET',
        })
        .then(response => {
            if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
          sortMessageData(data)
          getUniqueDays(data)
          setLoading(false); 
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
    //add messageSent and imgSubmitted so the messagebox re-renders after a message/image is sent
    }, [selectedPerson, messageSent, imgSubmitted]); 

    //get the unique days in message history
  function getUniqueDays(messageHistory){
    var uniqueArray = messageHistory.filter((value, index, self) =>
    index === self.findIndex((t) => (
      // check if the dates are same on a day basis, with isSame function of dayjs
      // https://day.js.org/docs/en/query/is-same 
      dayjs(parseInt(t.date)).isSame(dayjs(parseInt(value.date)), "day")
    ))
  )
    //sort the dates in ascending order
    let sortedDates = uniqueArray.sort((message1, message2) => (message1.date > message2.date) ? 1 : (message1.date < message2.date) ? -1 : 0)
    //turn the dates in the arrays into day.js objects, with day-month-year format
    let messageDays = sortedDates.map(a => dayjs(parseInt(a.date)).format("D MMMM YYYY"));
    setMessageDays(messageDays)
  }

  //sort message data response from the fetch api
  function sortMessageData(data){
    //if sender and receiver are the same person (users are sending message to themselves), filter duplicates to display it once
    if(data[0]){
      if(data[0].from[0].email===data[0].to[0].email){
        const uniqueIds = [];
        const unique = data.filter(element => {
          const isDuplicate = uniqueIds.includes(element._id);
          if (!isDuplicate) {
            uniqueIds.push(element._id);
            return true;
          }
          return false;
        });
        return setMessagesBetween(unique)
      }
    }
    setMessagesBetween(data) 
  }

  //extract the hour from message's time data
  function getHour(messageDate){

    return dayjs(parseInt(messageDate)).format('HH:mm')

  }

  //divide messages based on the DAYS they've been sent
  function displayMessagesOnCertainDay(firstDate, secondDate){
    //returns true if the day from the firstDate and secondDate are the same
      return dayjs(firstDate).isSame(dayjs(parseInt(secondDate)), "day") 
  }
  
  return <div style={{ width: "100%"}}>
          <MainContainer responsive>                
            <ContactsBox
            sidebarStyle = {sidebarStyle}
            firstMsg={firstMsg}
            handleConversationClick={handleConversationClick}
            conversationAvatarStyle={conversationAvatarStyle}
            conversationContentStyle={conversationContentStyle}
            contactsBoxPeople={contactsBoxPeople} 
            setContactsBoxPeople ={setContactsBoxPeople}
            messageSent= {messageSent}
            messagesBetween={messagesBetween}
            />
        {/* display only if user selects a person */}
        {selectedPerson? 
            <ChatContainer style={chatContainerStyle}>

              <ConversationHeader>
                <ConversationHeader.Back  onClick={handleBackClick}/>
                <div as="Avatar" className='messageBoxHeaderAvatar'>
                <MuiAvatar
                as="Avatar"
                user={selectedPerson}/>  
                </div> 
                <ConversationHeader.Content userName={selectedPerson.name}/>        
              </ConversationHeader>

          {loading?
              /* use as="Conversation2" to give the ConversationList component a child component that it allows
              to solve the  "div" is not a valid child" error.
              https://chatscope.io/storybook/react/?path=/docs/documentation-recipes--page#changing-component-type-to-allow-place-it-in-container-slot */
            <div as="InputToolbox2" className='circularProgressContainer'>
            <Box sx={{ display: 'flex' }}>
                <CircularProgress size="5rem" />
            </Box>
            </div>
            :
              <MessageList >

                <MessageList.Content className="messageListContent">
          {messageDays.map((day) => (
            <div key={day}>
            {/* Produces a seperator for each seperate day of messaging between the selectedPerson and user */}
              <MessageSeparator  content={day} />            
              {//sort data according to time, in ascending order
            messagesBetween.sort((message1, message2) => (message1.date > message2.date) ? 1 : (message1.date < message2.date) ? -1 : 0)
            //divide messages into days, display each day under the "day" variable that's mapped above from messageDays
            .map((message) => (
              displayMessagesOnCertainDay(day, message.date)&&
                <MessageGroup 
                key = {message["_id"]}
                //if the sender and receiver is the same (user has sent it to themselves, display it as sender)
                direction={(message.to[0]["_id"]===message.from[0]["_id"]? "outgoing"
                //otherwise, sort it out as receiver and sender
                : 
                (selectedPerson["_id"]===message.from[0]["_id"]? "incoming" :"outgoing"))}
                >          
                  {/* use "as="Avatar" attribute because the parent component from chatscope doesn't accept a child that isn't named "Avatar" */}
                  <div as="Avatar" className="messageBoxAvatar">
                    <MuiAvatar 
                  user={message.from[0]}/>    
                  </div>     
                    <MessageGroup.Messages>
                      <Message model={{
                        //if the message is an image, display image
                        message: message.image? null : message.message,
                        sender: message.from[0].toString(),
                        //if the sender and receiver is the same (user has sent it to themselves, display it as sender)
                        direction: (message.to[0]["_id"]===message.from[0]["_id"]? "outgoing"
                        //otherwise, sort it out as receiver and sender
                        : 
                        (selectedPerson["_id"]===message.from[0]["_id"]? "incoming" :"outgoing")),
                        position: "single",
                      }}>
                      {message.image?
                      <Message.ImageContent className="msgBoxImg1" src={import.meta.env.VITE_BACKEND_URL+"/images/" + message.image} alt="image" />
                      :null}
                  </Message>
                    </MessageGroup.Messages>    
                    <MessageGroup.Footer >{getHour(message.date)}</MessageGroup.Footer>          
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
      : <div className="noPersonSelectedContainer">
          <img src="../src/assets/logo.png" alt="logo" />
        <p>ChatChirp</p> 
      </div>
      
      
      }                         
      </MainContainer>
      </div>;
}

  
    
export default MessageBox;


