/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import ContactsBox from "../components/ContactsBox2.jsx"
import '../styles/MessageBox.css'
import MessageBox from "../components/MessageBox.jsx"



const Messages = () => {


    return (
        <div className='MessagesPageContainer'>
            {/* <ContactsBox/>  */}
           <MessageBox/> 
         <h1>This is the HomePage!</h1> 
         
        </div>
      );
    };
    
    
export default Messages;