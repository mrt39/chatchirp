/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react'
import { UserContext } from '../contexts/UserContext';
import { useOutletContext } from "react-router-dom";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MessageInput } from "@chatscope/chat-ui-kit-react";
import '../styles/MessageInputBox.css'
import FileInputPopover from "./Popover.jsx"
import Snackbar from "./Snackbar.jsx"
import { cleanTextContent } from '../utilities/textUtils';
import { handleImageValidation } from '../utilities/formValidation';
import { sendMessage } from '../utilities/api';
import { sendImageMessage } from '../utilities/api';

export default function MessageInputBox ({messageSent, setMessageSent, contactsBoxPeople, firstMsg, setFirstMsg, imgSubmitted, setImgSubmitted, setContactsBoxPeople}) {
  //pass the UserContext 
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen] = useOutletContext();
  
  //Set initial message input value to an empty string                                                                     
  const [messageInputValue, setMessageInputValue] = useState("");

  //detect when the user has clicked has either pressed enter or clicked the "send message" icon
  const [userPressedSend, setuserPressedSend] = useState(false);

  /*detect if it's the first message between the user and the person they're sending a message to.
  arrange it as an additional state check before the useeffect, instead of toggling firstMsg state directly,
  so that re-render of Contactsbox doesn't happen before the message is sent */  
  const [firstMessageBetween, setfirstMessageBetween] = useState(false);

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
  }, [selectedPerson]); 
    
  /* ---------------IMAGE UPLOAD FUNCTIONALITY--------------- */
  
  //use ref to be able to select an element within a function (for displaying popover)
  const fileInputRef = useRef(null);
  //anchor for popover
  const [popOveranchorEl, setPopOverAnchorEl] = useState(null);

  const [imageFile, setimageFile] = useState();
  //trigger when user selects an image
  const [imageSelected, setimageSelected] = useState(false);

  //when the attachment icon is clicked, click on the hidden input (type=file) element
  function handleAttachmentClick() {
    fileInputRef.current.click();
  }

  //when user selects an image and changes the value of the input, change the state 
  function handleFileInputChange(event) {
    const selectedFile = event.target.files[0];
    
    //check the filetype to ensure it's an image and validate size
    if (!handleImageValidation(selectedFile, setSnackbarOpenCondition, setSnackbarOpen)) {
      return;
    } else {
      setimageSelected(true);
      setimageFile(selectedFile);
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
  }

  //effect for handling posting the image
  useEffect(() => {
    async function sendImage() {
      try {
        await sendImageMessage(imageFile, currentUser, selectedPerson);
        
        setMessageSent(!messageSent);
        setImgSubmitted(false);
        setimageSelected(false);
        
        //if first message between the user and the person they're sending a message to
        if(firstMessageBetween === true){
          setFirstMsg(!firstMsg);
          setfirstMessageBetween(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    //only send an image when imgSubmitted is true
    if(imgSubmitted === true){
      sendImage();
    }
  }, [imgSubmitted]);
    
  //if a popover is opened from image selection, display it, otherwise don't display anything
  return (
    <>
      <Snackbar 
        snackbarOpen={snackbarOpen} 
        setSnackbarOpen={setSnackbarOpen}
        snackbarOpenCondition={snackbarOpenCondition}
      />
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