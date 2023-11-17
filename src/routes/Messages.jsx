/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import '../styles/MessageBox.css'
import MessageBox from "../components/MessageBox.jsx"



const Messages = ({currentUser}) => {


    return (
        <div className='MessagesPageContainer'>
           <MessageBox
           currentUser = {currentUser}
           /> 
         <h1>This is the HomePage!</h1> 
         
        </div>
      );
    };
    
    
export default Messages;