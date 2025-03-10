/* eslint-disable react/prop-types */
import { Link as RouterLink, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import '../styles/Login.css';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from "../components/Snackbar.jsx";
import Footer from "../components/Footer.jsx";
import { loginWithCredentials, loginWithGoogle, loginWithDemo } from '../utilities/auth';
import { useUI } from '../contexts/UIContext';
import { useAuthorization } from '../contexts/AuthorizationContext';

export default function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuthorization();
  const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen } = useUI();

  const [clickedLogin, setClickedLogin] = useState(false);
  const [loginData, setLoginData] = useState({});

  function handleGoogleClick() {
    loginWithGoogle();
  }

  function handleDemoSigninClick() {
    setLoginData({email:"demoacc@demoacc.com", password: import.meta.env.VITE_DEMOACC_PW});
    setClickedLogin(true);
  }

  function handleChange(event) {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setClickedLogin(true);
  };

  useEffect(() => {
    async function loginUser() {
      try {
        await loginWithCredentials(loginData);
        console.warn("Login successful");
        setClickedLogin(false);
        // Redirect to the external URL
        window.location.replace(import.meta.env.VITE_FRONTEND_URL);
      } catch (error) {
        console.error("Login failed: " + error);
        setSnackbarOpenCondition("wrongLoginDeets");
        setSnackbarOpen(true);
        setClickedLogin(false);
      }
    }
    
    /* only trigger when login is attempted */
    if (clickedLogin === true) {
      loginUser();
    } 
  }, [clickedLogin]);

  //redirect if already authenticated
  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon id="lockIcon1" />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              className="loginSignupTextField"
              id="email"
              label="E-mail Address"
              type="email"
              name="email"
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              className="loginSignupTextField"
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange={handleChange}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Button
              id="signinWithDemoAcc"
              type="button"
              onClick={handleDemoSigninClick}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In With Demo Account
            </Button>
            <Button
              id="googleSignInBtn"
              type="button"
              onClick={handleGoogleClick}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In With Google
            </Button>
            <Grid container className="loginSignupLinkContainer">
              <Grid item>
                <RouterLink className="signUpLink" to="/signup">
                  {"Don't have an account? Sign Up"}
                </RouterLink>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Snackbar />
      </Container>
      <Footer />
    </>
  );
}