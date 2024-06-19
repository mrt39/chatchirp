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
import "../styles/account-profile-details.css"
import { clean } from 'profanity-cleaner';



export const AccountProfileDetails = ({user, setSnackbarOpen, invalidEmail, setInvalidEmail,  setSnackbarOpenCondition, profileUpdated, setProfileUpdated}) => {

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio,
  });
  const [profileUpdateToggle, setprofileUpdateToggle] = useState(false)

  function handleChange (event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value
  });
  }
 
  //email validation
  useEffect(() => {
    if(values.email.includes("@")){
      //if the snackbar is already opened, close it
      setSnackbarOpen(false)
      //wait until snackbar closes to change the e-mail invalid state
      setTimeout(function() {
      setInvalidEmail(false)
      }, 200);
      }
      else{
      setSnackbarOpen(false)
      setTimeout(function() {
        setInvalidEmail(true)  
      }, 200);
      
      }
  }, [values.email]);


  function handleSubmit (event) {
    event.preventDefault();
    //if mail address is invalid, don't update
    if(invalidEmail){
      setSnackbarOpenCondition("wrongEmail")
      setSnackbarOpen(true)
      return
    }else if(values.name.length>30){
      setSnackbarOpenCondition("nameTooLong")
      setSnackbarOpen(true)
      return
    }else if (values.bio)
        if(values.bio.length>100){
          setSnackbarOpenCondition("bioTooLong")
          setSnackbarOpen(true)
          return
    }else if(values.email.length>50){
      setSnackbarOpenCondition("emailTooLong")
      setSnackbarOpen(true)
      return
    }
    setLoading(true)
    setprofileUpdateToggle(true)
    setProfileUpdated(false);
  }


    //effect for submitting the profile changes
    useEffect(() => {
      async function editProfile() {
        //on submit, clean the word with the profanity cleaner package
        //https://www.npmjs.com/package/profanity-cleaner
        let filteredName = await clean(values.name, { keepFirstAndLastChar: true, placeholder: '#' })
        let filteredEmail = await clean(values.email, { keepFirstAndLastChar: true, placeholder: '#' })
        let filteredBio = ""
        if(values.bio){
          filteredBio=await clean(values.bio, { keepFirstAndLastChar: true, placeholder: '#' })
        }
        

        fetch(import.meta.env.VITE_BACKEND_URL+'/editprofile/' + user["_id"], {
            method: 'PATCH',
            body: JSON.stringify({ name: filteredName, email: filteredEmail, bio: filteredBio}), 
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        })
        .then(async result => {
        if (result.ok) {
          let response = await result.json();
          console.warn(response);
          console.log("Profile Updated!");
          await setProfileUpdated(true);
          await setSnackbarOpenCondition("profileChangeSuccess")
          await setSnackbarOpen(true)
          setLoading(false)
          setprofileUpdateToggle(false)

        } else{
          console.error("There has been an error!")
          setSnackbarOpenCondition("failure")
          setSnackbarOpen(true)
          setLoading(false)
          setprofileUpdateToggle(false)
          setProfileUpdated(false);
        }  
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }

      //only trigger when profile is updated
      if (profileUpdateToggle ===true){
      editProfile();
      } 
}, [profileUpdateToggle]);

 

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <Card
      className='profileDetails'>
        {loading? 
        <CircularProgress
        size={57}/>
        :
        <CardHeader
          title="Details"
        />
        }
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  disabled={loading ||user.email === "demoacc@demoacc.com" ? true : false} 
                  fullWidth
                  label="Name"
                  name="name"
                  className='profileDetailsTextField'
                  onChange={handleChange}
                  required
                  value={values.name}
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                <TextField
                  disabled={loading ||user.email === "demoacc@demoacc.com" ? true : false}
                  fullWidth
                  error={invalidEmail}
                  helperText={invalidEmail? 'Invalid E-mail address!' : ' '}   
                  label="E-mail Address"
                  name="email"
                  className='profileDetailsTextField'
                  type="email"
                  required
                  onChange={handleChange}
                  value={values.email}
                />
              </Grid>
              <Grid
                xs={12}
                md={12}
              >
                <TextField
                  disabled={loading ||user.email === "demoacc@demoacc.com" ? true : false}
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
          disabled={loading ||user.email === "demoacc@demoacc.com" ? true : false}
          variant="contained"
          onClick={handleSubmit}>
            Save details
          </Button>

        </CardActions>
      </Card>
    </form>
  );
};