import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import ErrorPage from "./routes/Error-Page.jsx";
import Profile from "./routes/Profile.jsx";
import Messages from './routes/Messages.jsx';
import Login from './routes/Login.jsx';
import Login2 from './routes/Login2.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      { index: true, element: <Login/> },
      { path: "profile", element: <Profile />},
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
