import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import './styles/App.css'
import React from 'react'
import { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorPage from "./routes/Error-Page.jsx";
import Profile from "./routes/Profile.jsx";
import Messages from './routes/Messages.jsx';
import Login from './routes/Login.jsx';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



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
          setUser(data)
          setLoading(false); // Set loading to false once the data is received
        })
        .catch(error => {
            setLoading(false); // Set loading to false once the data is received
            console.error('Error:', error)});
    };
    getUser();
  }, []); 

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
      {user && <Navbar user={user} />} {/* Render Navbar if user is logged in */}
        <Routes>
          <Route 
          path="/" 
          element={user ? <Messages user={user}/> : <Navigate to="/login" /> } 
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user}/> : <Navigate to="/login" />}
          /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
