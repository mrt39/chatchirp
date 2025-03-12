/* eslint-disable react/prop-types */

//context for managing all users data with optimized API calls and caching
//this context prevents multiple API calls to the getallusers endpoint
import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { fetchAPI } from '../utilities/api';
import { cacheAllUsers, getCachedAllUsers } from '../utilities/storageUtils';

//create the context
const AllUsersContext = createContext();

export function AllUsersProvider({ children }) {
  //state for storing all users data
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  //useref to track fetch status to prevent duplicate API calls
  //using refs here because it persists between renders without triggering re-renders when modified
  const requestStateRef = useRef({
    inProgress: false, //tracks if a fetch is currently in progress
    initialized: false, //tracks if users have been loaded at least once in this session
    requestId: 0, //used to handle conflicting conditions between multiple API calls
    lastFetchTime: 0 //timestamp of last successful fetch 
  });

  //fetch users with cache support
  //useCallback ensures this function maintains the same reference between renders
  //without useCallback, it would create a new function instance on every render
  const fetchAllUsers = useCallback(async (forceRefresh = false) => {
    //prevent duplicate simultaneous requests
    //this blocks redundant API calls if one is already happening
    //important preventing the multiple simultaneous requests observed due to re-renders
    if (requestStateRef.current.inProgress) {
      console.log("Users fetch already in progress, skipping duplicate request");
      return;
    }
    
    //check if we should use cached data
    if (!forceRefresh) {
      //if already initialized and we have users, don't fetch again
      if (requestStateRef.current.initialized && allUsers.length > 0) {
        console.log("Using already loaded users data, skipping API call");
        return;
      }
      
      //try to get from cache if not forcing refresh
      const cachedData = getCachedAllUsers();
      if (cachedData && cachedData.length > 0) {
        console.log("Using cached users data from storage");
        setAllUsers(cachedData);
        requestStateRef.current.initialized = true;
        return;
      }
    }
    
    //mark request as in progress to prevent duplicates
    requestStateRef.current.inProgress = true;
    //generate and store unique ID for this request
    const currentRequestId = ++requestStateRef.current.requestId;
    
    console.log("Fetching all users from API...");
    setUsersLoading(true);
    
    try {
      //make the API request to get all users
      const data = await fetchAPI('/getallusers', {
        method: 'GET'
      });
      
      //only update state if this is still the current request
      if (currentRequestId === requestStateRef.current.requestId) {
        setAllUsers(data);
        requestStateRef.current.initialized = true;
        requestStateRef.current.lastFetchTime = Date.now();
        
        //cache the results for future use
        cacheAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    } finally {
      //only update loading state if this is still the current request
      if (currentRequestId === requestStateRef.current.requestId) {
        setUsersLoading(false);
        requestStateRef.current.inProgress = false;
      }
    }
  }, [allUsers.length]); //only depends on allUsers.length to prevent unnecessary recreations

  //trigger initial users fetch when component renders
  //this effect runs once when the component mounts
  useEffect(() => {
    //check if we've already initialized to prevent duplicate fetches
    //this condition prevents unnecessary API calls on component re-renders
    if (!requestStateRef.current.initialized) {
      console.log("Initial all users fetch triggered");
      fetchAllUsers();
    }
    
    //cleanup function to reset state
    return () => {};
  }, [fetchAllUsers]);


  const contextValue = {
    allUsers,
    setAllUsers,
    usersLoading,
    fetchAllUsers
  };

  return (
    <AllUsersContext.Provider value={contextValue}>
      {children}
    </AllUsersContext.Provider>
  );
}

//custom hook for using all users context
export function useAllUsers() {
  return useContext(AllUsersContext);
}