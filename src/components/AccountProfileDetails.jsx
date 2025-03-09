/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  TextField,
  Unstable_Grid2 as Grid
} from '@mui/material';
import "../styles/AccountProfileDetails.css";
import { clean } from 'profanity-cleaner';
import { validateEmail } from '../utilities/formValidation';
import { updateProfile } from '../utilities/api';
import { useUI } from '../contexts/UIContext';
import { useAuthorization } from '../contexts/AuthorizationContext';

export default function AccountProfileDetails() {
  const { currentUser, setProfileUpdated } = useAuthorization();
  const { 
    snackbarOpenCondition, 
    setSnackbarOpenCondition, 
    snackbarOpen, 
    setSnackbarOpen, 
    invalidEmail, 
    setInvalidEmail 
  } = useUI();

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: currentUser.name,
    email: currentUser.email,
    bio: currentUser.bio,
  });
  const [profileUpdateToggle, setprofileUpdateToggle] = useState(false);

  function handleChange(event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  }
 
  //email validation
  useEffect(() => {
    if(!values.email){
      return;
    }
    
    if (!validateEmail(values.email)){
      //if the snackbar is already opened, close it
      setSnackbarOpen(false);
      //wait until snackbar closes to change the e-mail invalid state
      setTimeout(function() {
        setInvalidEmail(true);
      }, 200);
    } else {
      setSnackbarOpen(false);
      setTimeout(function() {
        setInvalidEmail(false);
      }, 200);
    }
  }, [values.email]);

  function handleSubmit(event) {
    event.preventDefault();
    
    //if mail address is invalid, don't update
    if(invalidEmail){
      setSnackbarOpenCondition("wrongEmail");
      setSnackbarOpen(true);
      return;
    } else if(values.name.length > 30){
      setSnackbarOpenCondition("nameTooLong");
      setSnackbarOpen(true);
      return;
    } else if (values.bio && values.bio.length > 100){
      setSnackbarOpenCondition("bioTooLong");
      setSnackbarOpen(true);
      return;
    } else if(values.email.length > 50){
      setSnackbarOpenCondition("emailTooLong");
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    setprofileUpdateToggle(true);
    setProfileUpdated(false);
  }

  //effect for submitting the profile changes
  useEffect(() => {
    async function editProfile() {
      try {
        //on submit, clean the word with the profanity cleaner package
        const filteredName = await clean(values.name, { keepFirstAndLastChar: true, placeholder: '#' });
        const filteredEmail = await clean(values.email, { keepFirstAndLastChar: true, placeholder: '#' });
        let filteredBio = "";
        
        if(values.bio){
          filteredBio = await clean(values.bio, { keepFirstAndLastChar: true, placeholder: '#' });
        }
        
        await updateProfile(currentUser._id, {
          name: filteredName,
          email: filteredEmail,
          bio: filteredBio,
        });
        
        console.log("Profile Updated!");
        await setProfileUpdated(true);
        await setSnackbarOpenCondition("profileChangeSuccess");
        await setSnackbarOpen(true);
        setLoading(false);
        setprofileUpdateToggle(false);
      } catch (error) {
        console.error("There has been an error!", error);
        setSnackbarOpenCondition("failure");
        setSnackbarOpen(true);
        setLoading(false);
        setprofileUpdateToggle(false);
        setProfileUpdated(false);
      }
    }

    //only trigger when profile is updated
    if (profileUpdateToggle){
      editProfile();
    } 
  }, [profileUpdateToggle]);

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <Card className='profileDetails'>
        {loading ? 
          <CircularProgress size={57}/>
          :
          <CardHeader title="Details"/>
        }
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid xs={12} md={6}>
                <TextField
                  disabled={loading || currentUser.email === "demoacc@demoacc.com" ? true : false} 
                  fullWidth
                  label="Name"
                  name="name"
                  className='profileDetailsTextField'
                  onChange={handleChange}
                  required
                  value={values.name}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  disabled={loading || currentUser.googleId || currentUser.email === "demoacc@demoacc.com" ? true : false}
                  fullWidth
                  error={invalidEmail}
                  helperText={invalidEmail ? 'Invalid E-mail address!' : ' '}   
                  label="E-mail Address"
                  name="email"
                  className='profileDetailsTextField'
                  type="email"
                  required
                  onChange={handleChange}
                  value={values.email}
                />
              </Grid>
              <Grid xs={12} md={12}>
                <TextField
                  disabled={loading || currentUser.email === "demoacc@demoacc.com" ? true : false}
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  className='profileDetailsTextField'
                  multiline
                  rows={4}
                  placeholder="Enter Your Bio"
                  onChange={handleChange}
                  value={values.bio}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button 
            disabled={loading || currentUser.email === "demoacc@demoacc.com" ? true : false}
            variant="contained"
            onClick={handleSubmit}
          >
            Save details
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}