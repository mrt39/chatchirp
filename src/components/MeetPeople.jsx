/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'
import { fetchAPI } from '../utilities/api';

export default function MeetPeople() {
  const [randomizedUsers, setRandomizedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //function for selecting three random users from allUsers data
  function randomizeUsers(data) {
    //if data is empty, return
    if (!data) {
      return;
    } //if there are less than 3 users registered in total, return
    else if (data.length < 3) {
      return;
    }
    else {
      let randomUsers = [];
      while (randomUsers.length < 3) {
        var x = Math.floor(Math.random() * data.length);
        let pickedUser = data[x];
        //make sure picked user is unique
        if (!randomUsers.includes(pickedUser)) {
          randomUsers.push(pickedUser);
        }
      }
      setRandomizedUsers(randomUsers);
    }
  }
    
  //fetch for getting data of all people
  useEffect(() => {
    const fetchRandomUsers = async () => {
      try {
        const data = await fetchAPI('/getallusers', {
          method: 'GET'
        });
        randomizeUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchRandomUsers();
  }, []); 

  return (
    <div className="searchPeopleContainer">
      <div className="searchResultDisplayContainer">
        {loading ? 
          <Box sx={{ display: 'flex' }}>
            <CircularProgress size="5rem" />
          </Box>
          :
          randomizedUsers.length > 2 ? 
            randomizedUsers.map((person) => (
              <div
                className="searchResults"
                key={person._id}
              >
                <UserCard person={person} />
              </div>
            ))
            : <p>Not enough users registered!</p>
        }
      </div>
    </div>
  );
}