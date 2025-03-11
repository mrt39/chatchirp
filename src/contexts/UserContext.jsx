/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { fetchUserProfile, updateProfile } from '../utilities/api';
import { useAuthorization } from './AuthorizationContext';
import { cacheUserProfile, getCachedUserProfile } from '../utilities/storageUtils';

//context for managing user profile data and operations
const UserContext = createContext();

export function UserProvider({ children }) {
  const { currentUser } = useAuthorization();
  
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [profileError, setProfileError] = useState(null);
  
  //useref for tracking profile fetch status to prevent duplicate API calls
  //refs will persist between renders without triggering re-renders when they change
  //this is important for preventing render loops while maintaining request state
  const profileFetchRef = useRef({
    inProgress: false, //tracks if a fetch is currently in progress to block duplicate requests
    initialized: false, //tracks if profile has been loaded at least once in this session
    requestId: 0 //used to handle race conditions between multiple API calls
  });

  //fetch user profile data when user is authenticated or when profile is updated
  useEffect(() => {
    //update the getUserProfile function inside the useEffect
    //to ensure it always uses latest state values and prevent stale closures
    async function getUserProfile() {
      //early return if no user is authenticated to prevent unnecessary work
      if (!currentUser) return;
      
      //check for in-progress requests to prevent duplicates
      //this blocks redundant API calls if one is already happening
      if (profileFetchRef.current.inProgress) {
        return;
      }
      
      //check if already initialized and not forced by profileUpdated
      //this prevents redundant fetches after initial data load
      if (profileFetchRef.current.initialized && !profileUpdated && profileData) {
        return;
      }
      
      //check cache first if not a profile update
      if (!profileUpdated) {
        //attempt to get user profile from cache using storageUtils functionality
        const cachedProfile = getCachedUserProfile(currentUser._id);
        if (cachedProfile) {
          setProfileData(cachedProfile); //use cached data without API call
          profileFetchRef.current.initialized = true; //mark as initialized
          setProfileLoading(false); //ensure loading state is off
          return; //return without making API request
        }
      }
      
      //track this request to prevent duplicate calls
      profileFetchRef.current.inProgress = true;
      //increment and capture request ID 
      //this allows to identify which request's response to use when multiple are in progress
      const currentRequestId = ++profileFetchRef.current.requestId;
      
      //only set loading if it's not already loading
      if (!profileLoading) {
        setProfileLoading(true);
      }
      setProfileError(null); //clear any previous errors
      
      try {
        //make the API request to get profile data
        const data = await fetchUserProfile(currentUser._id);
        
        //only update if this is still the current request
        if (currentRequestId === profileFetchRef.current.requestId) {
          if (data && Array.isArray(data) && data.length > 0) {
            setProfileData(data[0]); //update state with API response
            profileFetchRef.current.initialized = true; //mark as initialized
            
            //cache the profile data for future use
            if (!profileUpdated) {
              cacheUserProfile(currentUser._id, data[0]);
            }
          } else {
            console.error("Invalid profile data format:", data);
          }
          setProfileLoading(false);
          setProfileUpdated(false);
        }
      } catch (error) {
        //only update error state if this is still the current request
        //prevents error states from stale requests affecting the UI
        if (currentRequestId === profileFetchRef.current.requestId) {
          setProfileLoading(false);
          setProfileError(error.message);
          console.error('Error fetching user profile:', error);
          setProfileUpdated(false);
        }
      } finally {
        //only reset loading state if this is still the current request
        //ensures loading indicators are properly managed even with concurrent requests
        if (currentRequestId === profileFetchRef.current.requestId) {
          profileFetchRef.current.inProgress = false;
        }
      }
    }

    //trigger profile fetch when component first renders or when dependencies change
    //conditional execution prevents unnecessary API calls
    if (currentUser) {
      getUserProfile();
    }
  }, [currentUser, profileUpdated, profileLoading, profileData]);

  //function to update user profile
  const updateUserProfile = async (userData) => {
    if (!currentUser) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      await updateProfile(currentUser._id, userData);
      setProfileUpdated(true); //trigger re-fetch with fresh data
      return true;
    } catch (error) {
      setProfileError(error.message);
      console.error('Error updating profile:', error);
      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        profileData,
        profileLoading,
        profileError,
        profileUpdated,
        setProfileUpdated,
        updateUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}