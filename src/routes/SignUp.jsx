/* eslint-disable react/prop-types */
import { Link as RouterLink, useNavigate, Navigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext.jsx';
import '../styles/SignUp.css';
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
import { validateEmail } from '../utilities/formValidation';
import { cleanTextContent } from '../utilities/textUtils';
import { signUpWithCredentials } from '../utilities/auth';

export default function SignUp() {
  const navigate = useNavigate(); 

  // Passing the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 
  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen] = useOutletContext();
  const [submitted, setSubmitted] = useState(false);
  const [signUpData, setSignUpData] = useState({});
  const [emptyNameField, setEmptyNameField] = useState(false);
  const [emptyEmailField, setEmptyEmailField] = useState(false);
  const [invalidEmailField, setInvalidEmailField] = useState(false);
  const [emptyPasswordField, setEmptyPasswordField] = useState(false);

  // Form submission handler
  const handleSubmit = (event) => {
    event.preventDefault();

    if(emptyPasswordField || invalidEmailField || emptyEmailField || emptyNameField) {
      return;
    } else {
      setSubmitted(true);
    }
  };

  // Field change handler with validation
  function handleChange(event) {
    //validation
    if (event.target.name === "name") {
      setEmptyNameField(event.target.value === "");
    }
    
    if (event.target.name === "email") {
      if (event.target.value === "") {
        setEmptyEmailField(true);
      } else {
        setEmptyEmailField(false);
        setInvalidEmailField(!validateEmail(event.target.value));
      }
    }
    
    if (event.target.name === "password") {
      setEmptyPasswordField(event.target.value === "");
    }
    
    setSignUpData({
      ...signUpData,
      [event.target.name]: event.target.value
    });
  }

  // Set appropriate help text for email field
  function setEmailFieldHelperText() {
    if (emptyEmailField) {
      return "E-mail field can not be empty.";
    } else if (invalidEmailField) {
      return "Invalid E-mail!";
    } else {
      return null;
    }
  }

  // Handle signup submission
  useEffect(() => {
    async function registerUser() {
      try {
        // Clean name with profanity filter
        const filteredName = await cleanTextContent(signUpData.name);
        
        // Create signup data object
        const registerData = {
          name: filteredName, 
          email: signUpData.email, 
          password: signUpData.password
        };
        
        const response = await signUpWithCredentials(registerData);
        
        setSubmitted(false);
        
        if (response.name === "UserExistsError") {
          setSnackbarOpenCondition("alreadyRegistered");
          setSnackbarOpen(true);
        } else {
          console.log("Successfully registered user!");
          navigate("/findpeople"); 
          window.location.reload();
          setSnackbarOpenCondition("successfulRegister");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error during registration:", error);
        setSubmitted(false);
      }
    }
    
    if (submitted) {
      registerUser();
    } 
  }, [submitted]);

  return (
  <>
    {currentUser? <Navigate to="/" />
  : ""}
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
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField 
            margin="normal"
            fullWidth
            className="loginSignupTextField"
            id="name"
            label="Name"
            type="name"
            name="name"
            autoComplete="name"
            autoFocus
            required
            onChange={handleChange}
            error={emptyNameField}
            helperText={emptyNameField? "Name field can not be empty." :null}
          />
          <TextField 
            margin="normal"
            fullWidth
            className="loginSignupTextField"
            id="email"
            label="E-mail Address"
            type="email"
            name="email"
            required
            autoComplete="email"
            onChange={handleChange}
            error={emptyEmailField || invalidEmailField}
            helperText={setEmailFieldHelperText()}
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
            autoComplete="current-password"
            onChange={handleChange}
            error={emptyPasswordField}
            helperText={emptyPasswordField? "Password field can not be empty." :null}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          
          <Grid container className="loginSignupLinkContainer">
            <Grid item>
              <RouterLink className="signUpLink" to="/login">
                  {"Already have an account? Sign in"}
              </RouterLink>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Snackbar
        snackbarOpenCondition={snackbarOpenCondition}
        snackbarOpen={snackbarOpen}
        setSnackbarOpen={setSnackbarOpen}
      />
    </Container>
    <Footer/>
  </>
  );
}