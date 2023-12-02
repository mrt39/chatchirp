/* eslint-disable react/prop-types */
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
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




export default function SignUp({snackbarOpen, setSnackbarOpen, snackbarOpenCondition, setSnackbarOpenCondition}) {

  const navigate = useNavigate(); 


  const [submitted, setSubmitted] = useState(false);
  const [signUpData, setSignUpData] = useState({ });
  const [emptyNameField, setEmptyNameField] = useState(false);
  const [emptyEmailField, setEmptyEmailField] = useState(false);
  const [invalidEmailField, setInvalidEmailField] = useState(false);
  const [emptyPasswordField, setEmptyPasswordField] = useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(signUpData)

    if(emptyPasswordField||invalidEmailField||emptyEmailField||emptyNameField){
      return
    }
    else{
      setSubmitted(true) 
    }
  };

  function handleChange (event) {
    //validation
    if (event.target.name==="name"){
        if(event.target.value ===""){
          setEmptyNameField(true)
        }else{
          setEmptyNameField(false)
        }
    }
    if(event.target.name==="email"){
      if(event.target.value ===""){
        setEmptyEmailField(true)
      }else{
        if(event.target.value.includes("@")){
          setInvalidEmailField(false)
        }else{
        setInvalidEmailField(true)
        }
       setEmptyEmailField(false)
      }
    }
    if(event.target.name==="password"){
      if(event.target.value ===""){
        setEmptyPasswordField(true)
      }else{
        setEmptyPasswordField(false)
      }
    }
    setSignUpData({
        ...signUpData,
        [event.target.name]: event.target.value
  });
  }


  function setEmailFieldHelperText(){
    if(emptyEmailField){
      return "E-mail field can not be empty."
    }else if (invalidEmailField){
      return "Invalid E-mail!"
    }else{
      return null
    }
  }


    useEffect(() => {
        async function registerUser() {
            //on submit, clean the word with the profanity cleaner package
            //https://www.npmjs.com/package/profanity-cleaner
            /* let input = await clean(nameInput, { keepFirstAndLastChar: true }) */
            let result = await fetch(
            'http://localhost:5000/signup', {
                method: "post",
                /* if imageFile exists, send imageFile */  
                body: JSON.stringify({ name: signUpData.name, email: signUpData.email, password: signUpData.password}), 
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                }
            })
            if (result.ok) {
              let response = await result.json();
              console.warn(response);
              setSubmitted(false);
              if(response.name==="UserExistsError"){
                setSnackbarOpenCondition("alreadyRegistered")
                setSnackbarOpen(true)
              }else{
                console.log("Successfully registered user!")
                navigate("/"); 
                setSnackbarOpenCondition("successfulRegister")
                setSnackbarOpen(true)
              }
            }else{
              console.error("There has been an error!")
              console.error(result); 
              setSubmitted(false);
            }   
        }
        if (submitted ===true){
        registerUser();
        } 
    }, [submitted]);

  return (

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
            
            <Grid container>
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

  );
}