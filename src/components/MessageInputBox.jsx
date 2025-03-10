/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { MessageInput } from "@chatscope/chat-ui-kit-react";
import '../styles/MessageInputBox.css';
import FileInputPopover from "./Popover.jsx";
import Snackbar from "./Snackbar.jsx";
import { cleanTextContent } from '../utilities/textUtils';
import { useImageUpload } from '../utilities/imageUtils';
import { sendMessage } from '../utilities/api';
import { useMessage } from '../contexts/MessageContext';
import { useAuthorization } from '../contexts/AuthorizationContext';
import { useUI } from '../contexts/UIContext';

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
    if (!messageInputValue.trim()) return; //don't allow sending empty messages
    
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
        
        const result = await sendMessage(currentUser, selectedPerson, filteredMessage);
        
        setMessageInputValue("");
        setMessageSent(!messageSent);
        setuserPressedSend(false);
        
        //if first message between the user and the person they're sending a message to, toggle firstMsg state
        if(firstMessageBetween === true){
          setFirstMsg(!firstMsg);
          setfirstMessageBetween(false);
        }
        
        /* if the person user is sending message to is in the contactsbox,
        change the lastMsg attribute for the selectedperson within "contactsBoxPeople" state */
        if(contactsBoxPeople.find(person => person._id === selectedPerson._id)){
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
      setMessageSent(!messageSent);
      setImgSubmitted(false);
      setimageSelected(false);
      
      if (firstMessageBetween) {
        setFirstMsg(!firstMsg);
        setfirstMessageBetween(false);
      }
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