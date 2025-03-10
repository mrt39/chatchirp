/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { fetchUserProfile, updateProfile } from '../utilities/api';
import { useAuthorization } from './AuthorizationContext';

//context for managing user profile data and operations
const UserContext = createContext();

export function UserProvider({ children }) {
  const { currentUser } = useAuthorization();
  
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [profileError, setProfileError] = useState(null);

  //fetch user profile data when user is authenticated or when profile is updated
  useEffect(() => {
    async function getUserProfile() {
      if (!currentUser) return;
      
      setProfileLoading(true);
      setProfileError(null);
      
      try {
        const data = await fetchUserProfile(currentUser._id);
        setProfileData(data[0]);
        setProfileLoading(false);
        setProfileUpdated(false);
      } catch (error) {
        setProfileLoading(false);
        setProfileError(error.message);
        console.error('Error fetching user profile:', error);
        setProfileUpdated(false);
      }
    }

    if (currentUser) {
      getUserProfile();
    }
  }, [currentUser, profileUpdated]);

  //function to update user profile
  const updateUserProfile = async (userData) => {
    if (!currentUser) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      await updateProfile(currentUser._id, userData);
      setProfileUpdated(true);
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

//custom hook for using the user context
export function useUser() {
  return useContext(UserContext);
}