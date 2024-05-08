/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react'
import { useOutletContext } from "react-router-dom";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MessageInput
} from "@chatscope/chat-ui-kit-react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/MessageInputBox.css'
import FileInputPopover from "./Popover.jsx"
import { clean } from 'profanity-cleaner';


const MessageInputBox = ({messageSent, setMessageSent, contactsBoxPeople, firstMsg, setFirstMsg, imgSubmitted, setImgSubmitted}) => {



  {/* "useOutletContext" is how you get props from Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, currentUser, setCurrentUser, profileUpdated, setProfileUpdated, selectedPerson, setSelectedPerson] = useOutletContext();

    // Set initial message input value to an empty string                                                                     
    const [messageInputValue, setMessageInputValue] = useState("");



    function handleSend(){
      //if the person user is sending a message to isn't in the contacts, set firstMsg state to true.
      if (contactsBoxPeople.includes(selectedPerson)===false){
        setFirstMsg(!firstMsg)
      }

        setMessageSent(true)
    }
      
      /* effect for handling sending TEXT message */
      useEffect(() => {
        async function postMessage() {
            
            //on submit, clean the word with the profanity cleaner package
            //https://www.npmjs.com/package/profanity-cleaner
            let filteredMessage = await clean(messageInputValue, { keepFirstAndLastChar: true, placeholder: '#' }) 
  
            let result = await fetch(
            'http://localhost:5000/messagesent', {
                method: "post",
                body: JSON.stringify({ from: currentUser, to: selectedPerson, message: filteredMessage}), 
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                }
            })
            result = await result.json();
            console.warn(result);
            if (result) {
                console.log("Message sent");
                setMessageInputValue("");
                setMessageSent(false);
            }   
        }
        /* only trigger when message is sent */
        if (messageSent ===true){
        postMessage();
        } 
    }, [messageSent]);
  
  
    /* when selected person changes, clear input box */
    useEffect(() => {
        setMessageInputValue("")
      }, [selectedPerson]); 
      

    /* ---------------IMAGE UPLOAD FUNCTIONALITY--------------- */
    
    //using ref to be able to select an element within a function (for displaying popover)
    const fileInputRef = useRef(null)
    //anchor for popover
    const [popOveranchorEl, setPopOverAnchorEl] = useState(null);

    const [imageFile, setimageFile] = useState();
    //user selected an image from disk
    const [imageSelected, setimageSelected] = useState(false);

/*     //user pressed "send" after selecting the image
    const [imgSubmitted, setImgSubmitted] = useState(false); */

      //when the attachment icon is clicked, click on the hidden input (type=file) element
      function handleAttachmentClick(){
        fileInputRef.current.click()
      }

    /* when user selects an image and changes the value of the input, change the state  */
      function handleFileInputChange(event){
        const selectedFile = event.target.files;
        //check the filetype to ensure it's an image.
        if (selectedFile[0]["type"] != "image/x-png" && selectedFile[0]["type"] != "image/jpeg") {
          console.error("Only images can be attached!")
          return
        }
        else{
        setimageSelected(true)
        console.log(selectedFile);
        console.log(selectedFile[0]["type"]);
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


    /* function for sending the image */
    function handleImgSendBtn(){
        console.log("sent img");
        setImgSubmitted(true);
    }


    /* effect for handling sending the image */
    useEffect(() => {
      async function postMessage() {

        const formData = new FormData()
        formData.append("image", imageFile)
        formData.append("from", JSON.stringify({currentUser}) )
        formData.append("to", JSON.stringify({selectedPerson}))

        console.log(formData)
        
          let result = await fetch(
          'http://localhost:5000/imagesent', {
              method: "post",
              /* if imageFile exists, send imageFile */  
              body: formData, 
              headers: {
                  "Access-Control-Allow-Origin": "*",
              }
          })
          result = await result.json();
          console.warn(result);
          if (result) {
              console.log("Image sent");
              setimageFile("");
              setImgSubmitted(false);
          }   
      }
      /* only trigger when message is sent */
      if (imgSubmitted ===true){
      postMessage();
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
    </div>
    )
               
}

export default MessageInputBox;