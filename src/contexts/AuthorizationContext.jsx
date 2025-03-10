/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { fetchCurrentUser } from '../utilities/api';

//context for managing user authentication state
const AuthorizationContext = createContext();

export function AuthorizationProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);

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

  return (
    <AuthorizationContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        loading,
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