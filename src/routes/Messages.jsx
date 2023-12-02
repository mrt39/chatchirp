/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import '../styles/MessageBox.css'
import MessageBox from "../components/MessageBox.jsx"



const Messages = () => {


    return (
        <div className='MessagesPageContainer'>
           <MessageBox
           />       
        </div>
      );
    };
    
    
export default Messages;