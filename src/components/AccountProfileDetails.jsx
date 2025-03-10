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
import { cleanTextContent } from '../utilities/textUtils';
import { validateEmail } from '../utilities/formValidation';
import { useUI } from '../contexts/UIContext';
import { useAuthorization } from '../contexts/AuthorizationContext';
import { useUser } from '../contexts/UserContext';

export default function AccountProfileDetails() {
  const { currentUser, setCurrentUser } = useAuthorization();
  const { updateUserProfile, profileLoading, setProfileUpdated } = useUser();
  const { 
    snackbarOpenCondition, 
    setSnackbarOpenCondition, 
    snackbarOpen, 
    setSnackbarOpen, 
    invalidEmail, 
    setInvalidEmail 
  } = useUI();

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
    
    setprofileUpdateToggle(true);
  }

  //effect for submitting the profile changes
  useEffect(() => {
    async function editProfile() {
      try {
        //clean text content with profanity filter
        const filteredName = await cleanTextContent(values.name);
        const filteredEmail = await cleanTextContent(values.email);
        let filteredBio = "";
        
        if(values.bio){
          filteredBio = await cleanTextContent(values.bio);
        }
        
        const success = await updateUserProfile({
          name: filteredName,
          email: filteredEmail,
          bio: filteredBio,
        });
        
        if (success) {
          //update the currentUser state with the new profile information
          setCurrentUser({
            ...currentUser,
            name: filteredName,
            email: filteredEmail,
            bio: filteredBio
          });
          
          setSnackbarOpenCondition("profileChangeSuccess");
          setSnackbarOpen(true);
        } else {
          setSnackbarOpenCondition("failure");
          setSnackbarOpen(true);
        }
        
        setprofileUpdateToggle(false);
      } catch (error) {
        console.error("There has been an error:", error);
        setSnackbarOpenCondition("failure");
        setSnackbarOpen(true);
        setprofileUpdateToggle(false);
      }
    }

    //only trigger when profile update is requested
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
        {profileLoading ? 
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
                  disabled={profileLoading || currentUser.email === "demoacc@demoacc.com" ? true : false} 
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
                  disabled={profileLoading || currentUser.googleId || currentUser.email === "demoacc@demoacc.com" ? true : false}
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
                  disabled={profileLoading || currentUser.email === "demoacc@demoacc.com" ? true : false}
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
            disabled={profileLoading || currentUser.email === "demoacc@demoacc.com" ? true : false}
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