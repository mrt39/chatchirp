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

function AppContent() {
  const { currentUser, loading } = useAuthorization();

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
              <MessageProvider>
                <AppContent />
              </MessageProvider>
            </ContactsProvider>
          </UserProvider>
        </AuthorizationProvider>
      </UIProvider>
    </ThemeProvider>
  );
}