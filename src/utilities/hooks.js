import { useState, useEffect } from 'react';
import { fetchCurrentUser, fetchUserProfile } from './api';

//hook to manage theme
export const useTheme = () => {
  //load the theme from localstorage so that the user selection persists. use light theme as default.
  const savedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(savedTheme);

  //change the theme by altering the data-bs-theme attribute in index.html
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    //changes the background color of body to aliceblue with light color toggle. css in app.css
    document.body.className = theme === 'light' ? 'light-theme' : "";
    
    //save the theme to localstorage so that the user selection persists
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme];
};

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
    const getUserOnUpdate = async () => {
      try {
        if (!currentUser) return;
        
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
    
    //only call after the first fetch request is complete
    if (firstTimeLoading === false) {
      getUserOnUpdate();
    }
    //when first fetch is complete or profile is updated, update the currentUser state
  }, [profileUpdated, firstTimeLoading, currentUser]);

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