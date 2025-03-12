/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useRef } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'
import { useAuthorization } from '../contexts/AuthorizationContext';
import { useContacts } from '../contexts/ContactsContext'; //import contacts context
import { useAllUsers } from '../contexts/AllUsersContext'; //import all users context

export default function MeetPeople() {
  const { currentUser } = useAuthorization();
  //use the contexts instead of direct API calls to eliminate redundant API requests by using cached allusers data
  const { allUsers, usersLoading, fetchAllUsers } = useAllUsers();
  const { contacts } = useContacts();
  
  const [loading, setLoading] = useState(true);

  //ref to store randomized users to prevent flickering on re-renders
  //this preserves the user selection between renders for a consistent UI experience
  const randomUsersRef = useRef(null);

  //effect to coordinate data loading from contexts
  useEffect(() => {
    //check loading state from context states
    if (usersLoading) {
      setLoading(true);
    } else if (allUsers && allUsers.length > 0) {
      setLoading(false);
    }
    
    //ensure we have all users data, fetch if necessary
    //will only trigger if the context doesn't already have the data
    if (!allUsers || allUsers.length === 0) {
      fetchAllUsers();
    }
  }, [allUsers, usersLoading, fetchAllUsers]);

  //useMemo prevent same calculation to derive contact IDs from contacts
  //this extracts IDs needed for filtering, improves performance
  const contactUserIds = useMemo(() => {
    return contacts.map(contact => contact._id);
  }, [contacts]);

  //useMemo is used here to prevent same calculation from running on every render
  //it only recalculates when allUsers, contactUserIds or currentUser changes
  const randomizedUsers = useMemo(() => {    
    //if data is empty, return
    if (!allUsers || allUsers.length === 0) {
      return [];
    } 
    
    //filter out current user and users with conversation history (they shouldn't be displayed as "new users to connect")
    //this uses contactUserIds from the ContactsContext instead of making a separate API call
    const filteredUsers = allUsers.filter(user => 
      user._id !== currentUser?._id && !contactUserIds.includes(user._id)
    );

    // in order to prevent redundant fetch calls, use existing random selection if available and data hasn't changed
    if (randomUsersRef.current) {
      //check if all previously selected users are still valid
      const allUsersStillValid = randomUsersRef.current.every(user => 
        filteredUsers.some(u => u._id === user._id)
      );
      
      //if all users are still valid, return the existing selection
      //this prevents flickering, where displayed users change unnecessarily
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
        if (!randomUsers.includes(pickedUser)) {
          randomUsers.push(pickedUser);
        }
      }
      //store the new selection in the ref for future renders
      randomUsersRef.current = randomUsers;
      return randomUsers;
    }
  }, [allUsers, contactUserIds, currentUser]); //dependencies that will trigger recalculation

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