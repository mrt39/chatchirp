import { useState, useEffect } from 'react';
import { fetchCurrentUser, fetchUserProfile } from './api';

//hook to manage user authentication
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  const [profileUpdated, setProfileUpdated] = useState(false);

  // get the user data when logged in, also checks if the user is logged in after each refresh
  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await fetchCurrentUser();
        setCurrentUser(data);
        setLoading(false);
        setFirstTimeLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error:', error);
      }
    };
    
    // only call when it's the first time loading
    if (firstTimeLoading) {
      getUser();
    }
  }, [firstTimeLoading]);

  //change the user data from the stored user data in the session, to the actual user data in the db
  useEffect(() => {
    //skip if we're still in first loading or no current user
    if (firstTimeLoading || !currentUser) return;

    //only fetch profile when profileUpdated flag is true
    if (profileUpdated) {
      const getUserOnUpdate = async () => {
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
      };
      
      getUserOnUpdate();
    }
  }, [profileUpdated, firstTimeLoading]); 

  return { 
    currentUser, 
    setCurrentUser, 
    loading, 
    profileUpdated, 
    setProfileUpdated 
  };
};

//hook to manage message interactions
export const useMessaging = () => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [messagesBetween, setMessagesBetween] = useState({});
  const [loading, setLoading] = useState(true);

  //fetch messages when selectedPerson changes
  useEffect(() => {
    if (!selectedPerson) return;
    
    setLoading(true);
    //implement the fetch logic here
  }, [selectedPerson]);

  return {
    selectedPerson,
    setSelectedPerson,
    messagesBetween,
    setMessagesBetween,
    loading
  };
};