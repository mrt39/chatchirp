import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import ThemeButton from "./components/ThemeButton.jsx"
/* import Footer from './components/Footer.jsx'; */
import './styles/App.css'
import React from 'react'
import { useEffect, useState, createContext, Fragment  } from "react";
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, createRoutesFromElements } from "react-router-dom";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

//bootstrap styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


/* context created for theme (dark/light) */
export const ThemeContext = createContext();


export const UserContext = createContext({
  selectedPerson: (null),
  currentUser: (null),
  setSelectedPerson: () => {},
});



const App = () => {


  //theme (dark/light)
  //load the theme from localstorage so that the user selection persists. use light theme as default.
  const savedTheme = localStorage.getItem('theme') || 'light';

  const [theme, setTheme] = useState(savedTheme);


  //selected person on messagebox (contacts)
  const [selectedPerson, setSelectedPerson] = useState();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //first time loading
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  //state that turns true whenever user updates their profile from the /profile route
  const [profileUpdated, setProfileUpdated] = useState(false);

  //snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenCondition, setSnackbarOpenCondition] = useState();


  /* get the user data when logged in */
  useEffect(() => {
    const getUser = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/login/success', {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          setCurrentUser(data)
          setLoading(false); // Set loading to false once the data is received
          setFirstTimeLoading(false);
        })
        .catch(error => {
            setLoading(false); // Set loading to false once the data is received
            console.error('Error:', error)});
    };
    //only call when it's the first time loading
    if(firstTimeLoading){
    getUser();
    }
  }, []); 


  /* change the user data from the stored user data in the session, to the actual user data in the db */
  useEffect(() => {
    const getUserOnUpdate = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/profile/' + currentUser["_id"], {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          setCurrentUser(data[0])
          setLoading(false); // Set loading to false once the data is received
          setProfileUpdated(false)
        })
        .catch(error => {
          setLoading(false); // Set loading to false once the data is received
          console.error('Error:', error)});
          setProfileUpdated(false)
    };
  /* only call after the first fetch request is complete */
    if(firstTimeLoading===false){
    getUserOnUpdate();
    }
  /* when first fetch is complete or profile is updated, update the currentUser state */
  }, [profileUpdated, firstTimeLoading]); 



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
      <ThemeButton
        theme={theme}
        setTheme={setTheme}
      />
      {currentUser ? <Navbar 
      user={currentUser} 
      setCurrentUser={setCurrentUser}
      />
            : <Navigate to="/login" /> } 
      <UserContext.Provider value={{ currentUser, selectedPerson, setSelectedPerson, theme }}>
        {/* "context" is how you pass props to Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
        <Outlet  context={[snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated]} /> 
      </UserContext.Provider>

{/*       <Footer
      scene = {scene}
      /> */}
    </div>


  );
};

export default App;
