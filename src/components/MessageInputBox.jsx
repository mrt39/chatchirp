/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react'
import { UserContext } from '../App.jsx';
import { useOutletContext } from "react-router-dom";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MessageInput
} from "@chatscope/chat-ui-kit-react";
import '../styles/MessageInputBox.css'
import FileInputPopover from "./Popover.jsx"
import { clean } from 'profanity-cleaner';
import Snackbar from "./Snackbar.jsx"


const MessageInputBox = ({messageSent, setMessageSent, contactsBoxPeople, firstMsg, setFirstMsg, imgSubmitted, setImgSubmitted}) => {



  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen] = useOutletContext();
  //Set initial message input value to an empty string                                                                     
  const [messageInputValue, setMessageInputValue] = useState("");



  function handleSend(){
    //if the person user is sending a message to isn't in the contacts, set firstMsg state to true.
    if (contactsBoxPeople.includes(selectedPerson)===false){
      setFirstMsg(!firstMsg)
    }
      setMessageSent(true)
  }
    
  //useeffect to handle sending TEXT message
  useEffect(() => {
    async function postMessage() {
        
      //on submit, clean the word with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredMessage = await clean(messageInputValue, { keepFirstAndLastChar: true, placeholder: '#' }) 

      await fetch(import.meta.env.VITE_BACKEND_URL+'/messagesent', {
          method: "post",
          body: JSON.stringify({ from: currentUser, to: selectedPerson, message: filteredMessage}), 
          headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": "*",
          },
          credentials:"include" //required for sending the cookie data
      })
      .then(async result => {
        if (result.ok){
          let response = await result.json();
          console.warn(response);
          console.log("Message sent");
          setMessageInputValue("");
          setMessageSent(false);
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
      }); 
    }
    //only trigger when message is sent
    if (messageSent ===true){
    postMessage();
    } 
  }, [messageSent]);


  //when selected person changes, clear input box
  useEffect(() => {
      setMessageInputValue("")
  }, [selectedPerson]); 
    

  /* ---------------IMAGE UPLOAD FUNCTIONALITY--------------- */
  
  //use ref to be able to select an element within a function (for displaying popover)
  const fileInputRef = useRef(null)
  //anchor for popover
  const [popOveranchorEl, setPopOverAnchorEl] = useState(null);

  const [imageFile, setimageFile] = useState();
  //trigger when user selects an image
  const [imageSelected, setimageSelected] = useState(false);

    //when the attachment icon is clicked, click on the hidden input (type=file) element
    function handleAttachmentClick(){
      fileInputRef.current.click()
    }

  //when user selects an image and changes the value of the input, change the state 
  function handleFileInputChange(event){
    const selectedFile = event.target.files;
    //check the filetype to ensure it's an image. throw error if it isn't
    if (selectedFile[0]["type"] != "image/x-png" && selectedFile[0]["type"] != "image/png" && selectedFile[0]["type"] != "image/jpeg") {
      console.error("Only image files can be attached!")
      setSnackbarOpenCondition("notAnImage")
      setSnackbarOpen(true)
      return
      //if image size is > 1mb, throw error
    }else if(selectedFile[0]["size"] > 1048576){
      console.error("Image size is too big!")
      setSnackbarOpenCondition("sizeTooBig")
      setSnackbarOpen(true)
      return
    }else{
    setimageSelected(true)
    setimageFile(selectedFile[0]);
    }
  }

  //when an image is selected, activate the popover
  useEffect(() => {
    //only trigger if an image is selected
    if (imageSelected){
    /* select the attachment button next to the message input box and make it the anchor for the popover to be displayed over */
    const attachmentIcon = document.querySelector('.cs-button--attachment')
    setPopOverAnchorEl(attachmentIcon)
    }
  }, [imageSelected]);


  //function for sending the image
  function handleImgSendBtn(){
      setImgSubmitted(true);
  }


  //effect for handling posting the image
  useEffect(() => {
    async function sendImage() {

      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("from", JSON.stringify({currentUser}) )
      formData.append("to", JSON.stringify({selectedPerson}))
      
      await fetch(
        import.meta.env.VITE_BACKEND_URL+'/imagesent', {
            method: "post",
            //if imageFile exists, send imageFile  
            body: formData, 
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            credentials:"include" //required for sending the cookie data
        })
        .then(async result => {
          if(result.ok){
            let response = await result.json()
            console.log("Image sent");
            console.warn(response)
            setimageFile("");
            setImgSubmitted(false);
          } else{
            throw new Error(result);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    //only trigger when message is sent
    if (imgSubmitted ===true){
      sendImage();
    } 
  }, [imgSubmitted]);

  return (
  <div>
      <MessageInput placeholder="Type message here" 
      value={messageInputValue} 
      onChange={val => setMessageInputValue(val)} 
      onAttachClick={handleAttachmentClick} 
      onSend={handleSend}
      />
        <input ref={fileInputRef} type='file' name='fileInput' accept="image/*" className='fileInputMessageBox'
        onChange={handleFileInputChange}
        />
        <FileInputPopover
        popOveranchorEl={popOveranchorEl}
        imgSubmitted={imgSubmitted}
        setPopOverAnchorEl={setPopOverAnchorEl}
        setimageSelected={setimageSelected}
        handleImgSendBtn={handleImgSendBtn}
        />
        <Snackbar
        snackbarOpenCondition={snackbarOpenCondition}
        snackbarOpen={snackbarOpen}
        setSnackbarOpen={setSnackbarOpen}
      />
  </div>
  )
              
}

export default MessageInputBox