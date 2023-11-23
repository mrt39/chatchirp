/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import SearchPeople from "../components/SearchPeople";
import '../styles/FindPeople.css'




const FindPeople = ({currentUser, selectedPerson, setSelectedPerson}) => {


    return (
        <div className='findPeopleContainer'>
          <h1>Find People!</h1> 
        <SearchPeople
          currentUser = {currentUser}
          selectedPerson={selectedPerson} 
          setSelectedPerson={setSelectedPerson}
        />         
        </div>
      );
    };
    
    
export default FindPeople;