/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { fetchCurrentUser, fetchUserProfile } from '../utilities/api';

//context for managing user authentication state and related functions
const AuthorizationContext = createContext();

export function AuthorizationProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  const [profileUpdated, setProfileUpdated] = useState(false);

  //get the user data when logged in, also checks if the user is logged in after each refresh
  useEffect(() => {
    async function getUser() {
      try {
        const data = await fetchCurrentUser();
        setCurrentUser(data);
        setLoading(false);
        setFirstTimeLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error:', error);
      }
    }
    
    // only call when it's the first time loading
    if (firstTimeLoading) {
      getUser();
    }
  }, [firstTimeLoading]);

  //change the user data from the stored user data in the session, to the actual user data in the db
  useEffect(() => {
    async function getUserOnUpdate() {
      try {
        const data = await fetchUserProfile(currentUser["_id"]);
        setCurrentUser(data[0]);
        setLoading(false);
        setProfileUpdated(false);
      } catch (error) {
        setLoading(false);
        console.error('Error:', error);
        setProfileUpdated(false);
      }
    }
    //skip if we're still in first loading or no current user
    if (firstTimeLoading || !currentUser) return;

    //only fetch profile when profileUpdated flag is true
    if (profileUpdated) {
      getUserOnUpdate();
    }
  }, [profileUpdated, firstTimeLoading, currentUser]); 

  return (
    <AuthorizationContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        loading, 
        profileUpdated, 
        setProfileUpdated 
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}

//custom hook for using the authorization context
export function useAuthorization() {
  return useContext(AuthorizationContext);
}