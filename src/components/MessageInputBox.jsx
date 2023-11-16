/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MessageInput
} from "@chatscope/chat-ui-kit-react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import '../styles/MessageInputBox.css'



const MessageInputBox = ({currentUser, selectedPerson, messageSent, setMessageSent}) => {

    // Set initial message input value to an empty string                                                                     
    const [messageInputValue, setMessageInputValue] = useState("");
    const [imageFile, setimageFile] = useState();


    function handleSend(){
        setMessageSent(true)
      }
      
      /* effect for handling sending message */
      useEffect(() => {
        async function postMessage() {
            
            //on submit, clean the word with the profanity cleaner package
            //https://www.npmjs.com/package/profanity-cleaner
            /* let input = await clean(nameInput, { keepFirstAndLastChar: true }) */
          
            let result = await fetch(
            'http://localhost:5000/messagesent', {
                method: "post",
                /* if imageFile exists, send imageFile */  
                body: JSON.stringify({ from: currentUser, to: selectedPerson, message: messageInputValue}), 
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
  
  
  
  
      function handleAttachmentClick(){
        console.log("Add attachment button clicked")
        console.log(currentUser)
        console.log(selectedPerson)
      }

/* when selected person changes, clear input box */
    useEffect(() => {
        setMessageInputValue("")
      }, [selectedPerson]); 


    return (
    <MessageInput placeholder="Type message here" 
    value={messageInputValue} 
    onChange={val => setMessageInputValue(val)} 
    onAttachClick={handleAttachmentClick} 
    onSend={handleSend}
    />
    )
               
}

export default MessageInputBox;