/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'


export default function MeetPeople() {
  const [randomizedUsers, setRandomizedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //function for selecting three random users from allUsers data
  function randomizeUsers(data){

      //if data is empty, return
      if (!data){
        return
      } //if there are less than 3 users registered in total, return
      else if(data.length < 3){
        return
      }
      else{
        let randomUsers = []
        while (randomUsers.length<3) {
            var x = Math.floor(Math.random() * data.length);
            let pickedUser = data[x]
            //make sure picked user is unique
            if(!randomUsers.includes(pickedUser)){
            randomUsers.push(pickedUser)
            }
      }
      setRandomizedUsers(randomUsers)
      console.log(randomizedUsers)
      }
  }


    
  //fetch for getting data of all people
  useEffect(() => {
    const getMessages = () => {
        fetch(import.meta.env.VITE_BACKEND_URL+'/getallusers', {
        method: 'GET',
        })
        .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          randomizeUsers(data)
          setLoading(false); // Set loading to false once the data is received
        })
        .catch(error => {
          console.error('Error:', error);
          setLoading(false); 
        });
    };
    getMessages();
    }, []); 


  return (
    <div className="searchPeopleContainer">
      <div className="searchResultDisplayContainer">
      {loading? 
      <Box sx={{ display: 'flex' }}>
        <CircularProgress size="5rem" />
      </Box>
      :
      randomizedUsers.length>2? 
        randomizedUsers.map((person) => (
          <div
            className="searchResults"
            key={person._id}
          >
            <UserCard
            person = {person}
            />
          </div>
        ))
        :<p>Not enough users registered!</p>

      }
      </div>
    </div>
  );
  }