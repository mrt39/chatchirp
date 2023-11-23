/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import '../styles/MessageBox.css'
import MessageBox from "../components/MessageBox.jsx"



const Messages = ({currentUser, selectedPerson, setSelectedPerson}) => {


    return (
        <div className='MessagesPageContainer'>
           <MessageBox
           currentUser = {currentUser}
           selectedPerson={selectedPerson} 
           setSelectedPerson={setSelectedPerson}
           />       
        </div>
      );
    };
    
    
export default Messages;