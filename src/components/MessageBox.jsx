/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useContext  } from 'react'
import { UserContext } from '../App.jsx';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageGroup,
  Avatar,
  ConversationHeader,
  EllipsisButton,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import ContactsBox from "./ContactsBox";
import MessageInputBox from "./MessageInputBox.jsx";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/MessageBox.css'
import dayjs from 'dayjs'

const MessageBox = () => {

    // Passing the UserContext defined in app.jsx
    const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

    //messages between user and selected person
    const [messagesBetween, setMessagesBetween] = useState();
    //message days, to categorize the display of message under different days
    const [messageDays, setMessageDays] = useState();

    const [loading, setLoading] = useState(true);

    /* message sent from messageinputbox component */
    const [messageSent, setMessageSent] = useState(false)

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

    /* effect for styling the sidebar and conversation bar for lower resolutions */
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
      }, [selectedPerson, messageSent]); 

      /* get the unique days in message history */
    function getUniqueDays(messageHistory){
      var uniqueArray = messageHistory.filter((value, index, self) =>
      index === self.findIndex((t) => (
        // check if the dates are same on a day basis, with isSame function of dayjs
        // https://day.js.org/docs/en/query/is-same 
        dayjs(parseInt(t.date)).isSame(dayjs(parseInt(value.date)), "day")
      ))
    )

    console.log(uniqueArray)

    //sort the dates in ascending order
    let sortedDates = uniqueArray.sort((message1, message2) => (message1.date > message2.date) ? 1 : (message1.date < message2.date) ? -1 : 0)

    //turning the dates in the arrays into day.js objects, with day-month-year format
    let messageDays = sortedDates.map(a => dayjs(parseInt(a.date)).format("D MMMM YYYY"));

    console.log(messageDays)
    setMessageDays(messageDays)
    
    }

    //function for dividing messages into categories, based on the DAYS they've been sent
    function displayMessagesOnCertainDay(firstDate, secondDate){
      
      //returns true if the day from the firstDate and secondDate are the same
       return dayjs(firstDate).isSame(dayjs(parseInt(secondDate)), "day") 
    }

    function displayImage (imagelink){

      return (
        <img src={"http://localhost:5000/images/" + imagelink} alt="" />
      )
    }

    
    return <div style={{ width: "100%"

    }}>
           <MainContainer responsive>                
              
              <ContactsBox
              sidebarStyle = {sidebarStyle}
              handleConversationClick={handleConversationClick}
              conversationAvatarStyle={conversationAvatarStyle}
              conversationContentStyle={conversationContentStyle}
              />
          {/* display only if user selects a person */}
          {selectedPerson? 
             <ChatContainer style={chatContainerStyle}>

               <ConversationHeader>
                 <ConversationHeader.Back  onClick={handleBackClick}/>
                 <Avatar  src={selectedPerson.uploadedpic? "http://localhost:5000/images/" + selectedPerson.uploadedpic : selectedPerson.picture}  name={selectedPerson.name} />
                 <ConversationHeader.Content userName={selectedPerson.name} info="Active 10 mins ago" />
                 <ConversationHeader.Actions>
                      <EllipsisButton orientation="vertical" />
                 </ConversationHeader.Actions>          
               </ConversationHeader>

            {loading?
                /* using as="Conversation2" to give the ConversationList component a child component that it allows
                solving the  "div" is not a valid child" error.
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
                  direction={(message.from[0]["_id"]===selectedPerson["_id"]? "incoming" :"outgoing")}
                  >          
                      <Avatar /* src={joeIco} */ name={"Joe"} />          
                      <MessageGroup.Messages>
                        <Message model={{
                          /* if the message is an image, display image! */
                      message: message.image? null : message.message,
                      sentTime: "15 mins ago",
                      sender: "Joe",
                      direction: (message.from[0]["_id"]===selectedPerson["_id"]? "incoming" :"outgoing"),
                      position: "single",
                    }}>
                        {message.image?
                        <Message.ImageContent className="msgBoxImg1" src={"http://localhost:5000/images/" + message.image} alt="image" />
                        :null}
                    </Message>
                      </MessageGroup.Messages>    
                      <MessageGroup.Footer >23:50</MessageGroup.Footer>          
                  </MessageGroup>
               ))
              }
              </div>
            ))}

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
        : <p className="noPersonSelectedContainer">SELECT A PERSON TO TALK YO!</p> 
        
        }                         
           </MainContainer>
         </div>;
         }

    
    
export default MessageBox;

