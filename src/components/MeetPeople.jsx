/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'
import { fetchAPI } from '../utilities/api';

export default function MeetPeople() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //useMemo is used here to prevent same calculation from running on every render
  //it only recalculates when allUsers dependency change 
  const randomizedUsers = useMemo(() => {    
    //if data is empty, return
    if (!allUsers || allUsers.length === 0) {
      return;
    } 
    //if there are less than 3 users registered in total, return
    else if (allUsers.length < 3) {
      return;
    }
    else {
      let randomUsers = [];
      //continue the loop until we have 3 unique random users
      while (randomUsers.length < 3) {
        var x = Math.floor(Math.random() * allUsers.length);
        let pickedUser = allUsers[x];
        //make sure picked user is unique before adding to results
        //this ensures same person isn't being shown multiple times
        if (!randomUsers.includes(pickedUser)) {
          randomUsers.push(pickedUser);
        }
      }
      return randomUsers;
    }
  }, [allUsers]); //only recalculate when allUsers changes
    
  //fetch for getting data of all users
  useEffect(() => {
    const fetchRandomUsers = async () => {
      try {
        const data = await fetchAPI('/getallusers', {
          method: 'GET'
        });
        setAllUsers(data);
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