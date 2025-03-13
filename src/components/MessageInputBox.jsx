/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { MessageInput } from "@chatscope/chat-ui-kit-react";
import '../styles/MessageInputBox.css';
import FileInputPopover from "./Popover.jsx";
import Snackbar from "./Snackbar.jsx";
import { cleanTextContent, sanitizeMessage } from '../utilities/textUtils';
import { useImageUpload } from '../utilities/imageUtils';
import { sendMessage } from '../utilities/api';
import { useMessage } from '../contexts/MessageContext';
import { useAuthorization } from '../contexts/AuthorizationContext';
import { useUI } from '../contexts/UIContext';
import { useContacts } from '../contexts/ContactsContext'; //import contacts context to use addNewContact function

export default function MessageInputBox({contactsBoxPeople, setContactsBoxPeople}) {
  //use our contexts
  const { currentUser } = useAuthorization();
  const { 
    selectedPerson, 
    firstMsg, 
    setFirstMsg, 
    messageSent,
    setMessageSent,
    imgSubmitted,
    setImgSubmitted
  } = useMessage();
  const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen } = useUI();
  //get addNewContact function from ContactsContext
  //this function allows us to add a new contact to the contacts list immediately
  //without requiring a page reload or additional API calls
  const { addNewContact, updateContactLastMessage } = useContacts();
  
  //Set initial message input value to an empty string                                                                     
  const [messageInputValue, setMessageInputValue] = useState("");
  
  //detect when the user has clicked has either pressed enter or clicked the "send message" icon
  const [userPressedSend, setuserPressedSend] = useState(false);
  
  //detect if it's the first message between users
  const [firstMessageBetween, setfirstMessageBetween] = useState(false);
  
  //use ref to be able to select an element within a function (for displaying popover)
  const fileInputRef = useRef(null);
  //anchor for popover
  const [popOveranchorEl, setPopOverAnchorEl] = useState(null);
  //trigger when user selects an image
  const [imageSelected, setimageSelected] = useState(false);

  //use the centralized image upload hook
  const { 
    imageFile, 
    handleImageSelect, 
    sendImage 
  } = useImageUpload(setSnackbarOpenCondition, setSnackbarOpen);

  function handleSend() {
    //pre-sanitize the input to prevent sending empty messages
    if (!messageInputValue || !messageInputValue.trim()) {
      setMessageInputValue("");  //clear the input field for better UX
      return;
    } 
    
    setuserPressedSend(true);
    //if the person user is sending a message to isn't in the contacts box
    if (!contactsBoxPeople.find(person => person._id === selectedPerson._id)){
      setfirstMessageBetween(true);
    }
  }
    
  //useeffect to handle sending TEXT message
  useEffect(() => {
    async function postMessage() {
      try {
        //clean message with profanity filter 
        let filteredMessage = await cleanTextContent(messageInputValue); 
        
        //sanitize the message using validator.js sanitization function
        filteredMessage = sanitizeMessage(filteredMessage);
        
        //if sanitization returned null (empty message), don't send
        if (!filteredMessage) {
          setMessageInputValue("");
          setuserPressedSend(false);
          return;
        }
        
        const result = await sendMessage(currentUser, selectedPerson, filteredMessage);
        
        //if this is the first message with a new contact, add them to the contacts list
        if(firstMessageBetween === true){
          //add the selected person to contacts using the context function
          addNewContact(selectedPerson);
          
          setFirstMsg(!firstMsg);
          setfirstMessageBetween(false);
        }
        
        setMessageInputValue("");
        setMessageSent(!messageSent);
        setuserPressedSend(false);
        
        //if the person user is sending message to is in the contactsbox,
        //update the lastMsg attribute for the selectedperson
        if(contactsBoxPeople.find(person => person._id === selectedPerson._id)){
          //update the contact's last message in both context state and cache
          //this ensures the message persists between page refreshes
          updateContactLastMessage(selectedPerson._id, filteredMessage);

          let personIndex = contactsBoxPeople.findIndex(obj => obj._id == selectedPerson._id);
          contactsBoxPeople[personIndex].lastMsg.message = filteredMessage;
          setContactsBoxPeople([...contactsBoxPeople]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    //only trigger when message is sent
    if (userPressedSend === true){
      postMessage();
    } 
  }, [userPressedSend]);

  //when selected person changes, clear input box
  useEffect(() => {
    setMessageInputValue("");
  }, [selectedPerson?._id]); 
    
  /* ---------------IMAGE UPLOAD FUNCTIONALITY--------------- */
  
  //when the attachment icon is clicked, click on the hidden input (type=file) element
  function handleAttachmentClick() {
    fileInputRef.current.click();
  }

  //when user selects an image and changes the value of the input, change the state 
  function handleFileInputChange(event) {
    if (handleImageSelect(event)) {
      setimageSelected(true);
    }
  }

  //when an image is selected, activate the popover
  useEffect(() => {
    //only trigger if an image is selected
    if (imageSelected){
      const attachmentIcon = document.querySelector('.cs-button--attachment');
      setPopOverAnchorEl(attachmentIcon);
    }
  }, [imageSelected]);

  //function for sending the image
  function handleImgSendBtn() {
    setImgSubmitted(true);
    
    //check if it's the first message
    if (!contactsBoxPeople.find(person => person._id === selectedPerson._id)){
      setfirstMessageBetween(true);
    }
    
    sendImage(currentUser, selectedPerson, () => {
      //callback when send is complete
      
      //if this is the first message to a new contact, add them to the contacts list
      if (firstMessageBetween) {
        //add the selected person to contacts using the context function
        addNewContact(selectedPerson);
        
        setFirstMsg(!firstMsg);
        setfirstMessageBetween(false);
      }
      
      setMessageSent(!messageSent);
      setImgSubmitted(false);
      setimageSelected(false);
    });
  }
  
  return (
    <>
      <Snackbar />
      <input 
        name="fileInput"
        id="fileInput"
        type="file"
        style={{ display: 'none' }} 
        onChange={handleFileInputChange}
        ref={fileInputRef}
      />
      { popOveranchorEl != null || imageSelected ?  
        <FileInputPopover
          popOveranchorEl={popOveranchorEl}
          setPopOverAnchorEl={setPopOverAnchorEl}
          setimageSelected={setimageSelected}
          handleImgSendBtn={handleImgSendBtn}
          imgSubmitted={imgSubmitted}
        />
        : "" }
      <MessageInput 
        placeholder="Type message here" 
        value={messageInputValue}
        onChange={val => setMessageInputValue(val)}
        onSend={handleSend}
        attachButton={true}
        onAttachClick={handleAttachmentClick}
        disabled={popOveranchorEl != null || imageSelected ? true : false}
        sendButton={true}
        style={{ flexGrow: "1" }}/> 
    </>
  );
}