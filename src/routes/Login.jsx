/* eslint-disable react/prop-types */
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect, useCallback, useContext  } from 'react';
import { UserContext } from '../App.jsx';
import { useOutletContext, Navigate } from "react-router-dom";
import '../styles/Login.css'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from "../components/Snackbar.jsx"
import Footer from "../components/Footer.jsx";

export default function Login() {


  // Passing the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen] = useOutletContext();


  const [clickedLogin, setClickedLogin] = useState(false);
  const [loginData, setLoginData] = useState({ });

    function handleGoogleClick () {
        window.open("http://localhost:5000/auth/google", "_self");
    }

    function handleDemoSigninClick(){
      setLoginData({email:"demoacc@demoacc.com" , password: "demoacc"})
      setClickedLogin(true)
    }

  function handleChange (event) {
    setLoginData({
        ...loginData,
        [event.target.name]: event.target.value
  });
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(loginData) 
    setClickedLogin(true)
  };

  useEffect(() => {
    async function loginUser() {
        let result = await fetch(
          import.meta.env.VITE_BACKEND_URL+'/login', {
            method: "POST",
            body: JSON.stringify({ email: loginData.email, password: loginData.password}), 
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "http://localhost:5173",
            },
            credentials:"include" //required for sending the cookie data
        })
        if (result.ok) {
          let response = await result.json();
          console.warn(response);
          setClickedLogin(false);
          //redirect to the external URL
            window.location.replace(import.meta.env.VITE_FRONTEND_URL); 
      
        }else{
            if (result.status === 401) {
              console.error("Wrong e-mail or password!")
              setSnackbarOpenCondition("wrongLoginDeets")
              setSnackbarOpen(true)
            }else{
            console.error("There has been an error!")
            console.error(result);
          }
          setClickedLogin(false);
        }   
    }
    /* only trigger when message is sent */
    if (clickedLogin ===true){
      loginUser();
    } 
}, [clickedLogin]);




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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
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
             id="googleSignInBtn"
              type="button"
              onClick={handleGoogleClick}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In With Google
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

            <Grid container>
              <Grid item>
                <RouterLink className="signUpLink" to="/signup">
                    {"Don't have an account? Sign Up"}
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
      <Footer
      />
      </>
  );
}