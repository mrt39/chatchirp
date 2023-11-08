import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import ErrorPage from "./routes/Error-Page.jsx";
import Leaderboard from "./routes/Leaderboard.jsx";
import HomePage from './routes/HomePage.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
    children: [
      { index: true, element: <HomePage/> },
      { path: "leaderboard", element: <Leaderboard />},
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
