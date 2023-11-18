/* eslint-disable react/prop-types */
import { useCallback, useState, useEffect } from 'react';
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


export const AccountProfileDetails = ({user, setCurrentUser, setSnackbarOpen, invalidEmail, setInvalidEmail, snackbarOpenCondition, setSnackbarOpenCondition, profileUpdated, setProfileUpdated}) => {


  const [loading, setLoading] = useState(false);


  const [values, setValues] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio,
  });

  function handleChange (event) {
      setValues({
        ...values,
        [event.target.name]: event.target.value
  });
  }


  

  /* email validation function */
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
    }
    setLoading(true)
    setProfileUpdated(true)
  }


    /* effect for submitting the profile changes */
    useEffect(() => {
        async function editProfile() {
            //on submit, clean the word with the profanity cleaner package
            //https://www.npmjs.com/package/profanity-cleaner
            /* let input = await clean(nameInput, { keepFirstAndLastChar: true }) */
            let result = await fetch(
            'http://localhost:5000/editprofile/' + user["_id"], {
                method: 'PATCH',
                body: JSON.stringify({ name: values.name, email: values.email, bio: values.bio}), 
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                }
            })
            if (result.ok) {
              let response = await result.json();
              console.warn(response);
              console.log("Profile Updated!");
              setProfileUpdated(false);
              setSnackbarOpenCondition("success")
              setSnackbarOpen(true)
              setLoading(false)
            } else{
              console.error("There has been an error!")
              setProfileUpdated(false);
              setSnackbarOpenCondition("failure")
              setSnackbarOpen(true)
              setLoading(false)
            }  
        }
        /* only trigger when profile is updated*/
        if (profileUpdated ===true){
        editProfile();
        } 
    }, [profileUpdated]);

 

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <Card>
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
                  disabled={loading}
                  fullWidth
                  label="Name"
                  name="name"
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
                  disabled={loading}
                  fullWidth
                  error={invalidEmail}
                  helperText={invalidEmail? 'Invalid E-mail address!' : ' '}   
                  label="E-mail Address"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={values.email}
                />
              </Grid>
              <Grid
                xs={12}
                md={12}
              >
                <TextField
                  disabled={loading}
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
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
          disabled={loading}
          variant="contained"
          onClick={handleSubmit}>
            Save details
          </Button>

        </CardActions>
      </Card>
    </form>
  );
};