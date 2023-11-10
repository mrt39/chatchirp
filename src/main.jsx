import React from 'react'
import { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import ErrorPage from "./routes/Error-Page.jsx";
import Profile from "./routes/Profile.jsx";
import Messages from './routes/Messages.jsx';
import Login from './routes/Login.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
)
