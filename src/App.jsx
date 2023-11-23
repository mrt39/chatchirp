import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import './styles/App.css'
import React from 'react'
import { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorPage from "./routes/Error-Page.jsx";
import Profile from "./routes/Profile.jsx";
import FindPeople from "./routes/FindPeople.jsx";
import Messages from './routes/Messages.jsx';
import Login from './routes/Login.jsx';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const App = () => {

  //selected person on messagebox (contacts)
  const [selectedPerson, setSelectedPerson] = useState();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //first time loading
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  //state that turns true whenever user updates their profile from the /profile route
  const [profileUpdated, setProfileUpdated] = useState(false);


  /* get the user data when logged in */
  useEffect(() => {
    const getUser = () => {
      fetch('http://localhost:5000/login/success', {
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
          console.log(data)
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
      fetch('http://localhost:5000/profile/' + currentUser["_id"], {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          console.log(data)
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
    <BrowserRouter>
      <div className='appContainer'>
      {currentUser && <Navbar user={currentUser} />} {/* Render Navbar if user is logged in */}
        <Routes>
          <Route 
          path="/" 
          element={currentUser ? 
          <Messages 
            currentUser={currentUser}
            selectedPerson={selectedPerson} 
            setSelectedPerson={setSelectedPerson}

            /> 
            : <Navigate to="/login" /> } 
          />
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/profile"
            element={currentUser ? 
            <Profile 
            user={currentUser}
            setCurrentUser={setCurrentUser}
            profileUpdated={profileUpdated}
            setProfileUpdated={setProfileUpdated}
            /> 
            : 
            <Navigate to="/login" />}
          /> 
          <Route 
          path="/findpeople" 
          element={currentUser ? 
          <FindPeople 
          currentUser={currentUser}
          selectedPerson={selectedPerson} 
          setSelectedPerson={setSelectedPerson}
          /> 
          : <Navigate to="/login" /> } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
