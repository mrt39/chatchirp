import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import ThemeButton from "./components/ThemeButton.jsx"
/* import Footer from './components/Footer.jsx'; */
import './styles/App.css'
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

//bootstrap styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// import contexts
import { UserContext } from './contexts/UserContext';

// import hooks
import { useAuth } from './utilities/hooks';
import { useTheme } from './utilities/theme';


const App = () => {
  const [theme, setTheme] = useTheme();
  
  const { 
    currentUser, 
    setCurrentUser, 
    loading, 
    profileUpdated, 
    setProfileUpdated 
  } = useAuth();
  
  // selected person on messagebox (contacts)
  const [selectedPerson, setSelectedPerson] = useState();

  // snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenCondition, setSnackbarOpenCondition] = useState();

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
      {currentUser ? 
        <Navbar 
          user={currentUser} 
          setCurrentUser={setCurrentUser}
        />
        : <Navigate to="/login" />
      } 
      <UserContext.Provider value={{ currentUser, selectedPerson, setSelectedPerson, theme }}>
        {/* "context" is how you pass props to Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
        <Outlet context={[
          snackbarOpenCondition, 
          setSnackbarOpenCondition, 
          snackbarOpen, 
          setSnackbarOpen, 
          setCurrentUser, 
          profileUpdated, 
          setProfileUpdated
        ]} /> 
      </UserContext.Provider>
    </div>
  );
};

export default App;