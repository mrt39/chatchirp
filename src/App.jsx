import { useEffect } from 'react';
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import ThemeButton from "./components/ThemeButton.jsx"
import './styles/App.css'
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

//bootstrap styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

//import context providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthorizationProvider, useAuthorization } from './contexts/AuthorizationContext';
import { UserProvider } from './contexts/UserContext';
import { MessageProvider } from './contexts/MessageContext';
import { UIProvider } from './contexts/UIContext';
import { ContactsProvider } from './contexts/ContactsContext'; 
import { AllUsersProvider } from './contexts/AllUsersContext'; 

//import pusher utilities
import { connectPusher, authenticateUser, disconnectPusher } from './utilities/pusherUtilities';
//import sound utilities
import { preloadNotificationSound } from './utilities/soundUtils';

function AppContent() {
  const { currentUser, loading } = useAuthorization();

  //initialize pusher connection when user logs in
  //this effect establishes the websocket connection and authenticates it
  //it runs when the user authenticates and cleans up when they log out
  useEffect(() => {
    //only connect pusher if user is authenticated
    if (currentUser && currentUser._id) {

      //create the pusher connection to the backend
      const pusher = connectPusher();
      
      //authenticate the user with their ID
      //this links the pusher connection to this specific user on the server
      authenticateUser(currentUser._id);
      
      //cleanup function to disconnect pusher when component unmounts or user logs out
      return () => {
        disconnectPusher();
      };
    }
  }, [currentUser]); //re-run effect when user changes (login/logout)

  //preload notification sound when app initializes
  useEffect(() => {
    preloadNotificationSound();
  }, []); //empty dependency array means this runs once when component mounts

  if (loading) {
    return (
      <div className='circularProgressContainer'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
      </div>
    )
  }

  return (
    <div className='appContainer'>
      <ThemeButton />
      {currentUser ? 
        <Navbar /> 
        : <Navigate to="/login" />
      } 
      <Outlet /> 
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <AuthorizationProvider>
          <UserProvider>
            <ContactsProvider> 
              <AllUsersProvider> 
                <MessageProvider>
                  <AppContent />
                </MessageProvider>
              </AllUsersProvider>
            </ContactsProvider>
          </UserProvider>
        </AuthorizationProvider>
      </UIProvider>
    </ThemeProvider>
  );
}