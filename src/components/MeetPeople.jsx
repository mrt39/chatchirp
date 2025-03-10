/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useRef } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'
import { fetchAPI, fetchContacts } from '../utilities/api';
import { useAuthorization } from '../contexts/AuthorizationContext';

export default function MeetPeople() {
  const { currentUser } = useAuthorization();
  const [allUsers, setAllUsers] = useState([]);
  const [contactUserIds, setContactUserIds] = useState([]);
  const [loading, setLoading] = useState(true);

  //ref to track if we've already fetched the data to prevent duplicate requests
  const dataFetchedRef = useRef(false);
  //ref to store randomized users to prevent flickering (users displayed on screen changing) on re-renders
  const randomUsersRef = useRef(null);

  //fetch for getting data of all users and contacts
  useEffect(() => {
    //skip if we've already fetched data or there's no user
    if (dataFetchedRef.current || !currentUser) {
      if (!currentUser) {
        setLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        //fetch all users
        const userData = await fetchAPI('/getallusers', {
          method: 'GET'
        });
        
        //fetch contacts (users with conversation history)
        const contactsData = await fetchContacts(currentUser._id);
        const contactIds = contactsData.map(contact => contact._id);
        
        setAllUsers(userData);
        setContactUserIds(contactIds);

        //mark that we've fetched the data
        dataFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentUser?._id]); // Use ID instead of entire object to prevent unnecessary re-renders


  //useMemo is used here to prevent same calculation from running on every render
  //it only recalculates when allUsers dependency change 
  const randomizedUsers = useMemo(() => {    
    //if data is empty, return
    if (!allUsers || allUsers.length === 0) {
      return;
    } 
    
    //filter out current user and users with conversation history (they shouldn't be displayed as "new users to connect")
    const filteredUsers = allUsers.filter(user => 
      user._id !== currentUser._id && !contactUserIds.includes(user._id)
    );

    // in order to prevent redundant fetch calls, use existing random selection if available and data hasn't changed
    if (randomUsersRef.current) {
      //check if all previously selected users are still valid
      const allUsersStillValid = randomUsersRef.current.every(user => 
        filteredUsers.some(u => u._id === user._id)
      );
      
      //if all users are still valid, return the existing selection
      if (allUsersStillValid && randomUsersRef.current.length > 0) {
        return randomUsersRef.current;
      }
    }
    
    //if there are less than 3 eligible users, return them all
    if (filteredUsers.length < 3) {
      randomUsersRef.current = filteredUsers;
      return filteredUsers;
    }
    else {
      let randomUsers = [];
      //continue the loop until we have 3 unique random users
      while (randomUsers.length < 3) {
        var x = Math.floor(Math.random() * filteredUsers.length);
        let pickedUser = filteredUsers[x];
        //make sure picked user is unique before adding to results
        //this ensures same person isn't being shown multiple times
        if (!randomUsers.includes(pickedUser)) {
          randomUsers.push(pickedUser);
        }
      }
      //store the new selection in the ref
      randomUsersRef.current = randomUsers;
      return randomUsers;
    }
  }, [allUsers, contactUserIds, currentUser]); //only recalculate when these dependencies change

  return (
    <div className="searchPeopleContainer">
      <div className="searchResultDisplayContainer">
        {loading ? 
          <Box sx={{ display: 'flex' }}>
            <CircularProgress size="5rem" />
          </Box>
          :
          randomizedUsers && randomizedUsers.length > 0 ? 
            randomizedUsers.map((person) => (
              <div
                className="searchResults"
                key={person._id}
              >
                <UserCard person={person} />
              </div>
            ))
            : <p>No new users to meet right now!</p>
        }
      </div>
    </div>
  );
}