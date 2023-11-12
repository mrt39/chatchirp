/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import MessageBox from "../components/MessageBox.jsx"


const Messages = () => {


    return (
        <div className='MessagesPageContainer'>
          <MessageBox/>
          <h1>This is the HomePage!</h1>
        </div>
      );
    };
    
    
export default Messages;