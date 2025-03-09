import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import ErrorPage from "./routes/ErrorPage.jsx";
import Profile from "./routes/Profile.jsx";
import FindPeople from "./routes/FindPeople.jsx";
import Login from './routes/Login.jsx';
import SignUp from './routes/SignUp.jsx';
import Messages from './routes/Messages.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      { index: true, element: <Messages /> }, 
      { path: "profile", element: <Profile /> },
      { path: "findpeople", element: <FindPeople /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ], 
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);