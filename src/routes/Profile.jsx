/* eslint-disable react/prop-types */
import { useOutletContext} from "react-router-dom";
import { useState, useEffect } from 'react'
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { AccountProfile } from '../components/account-profile';
import { AccountProfileDetails } from '../components/account-profile-details';
import Snackbar from "../components/Snackbar.jsx"
import "../styles/Profile.css"




const Profile = () => {

     {/* "useOutletContext" is how you get props from Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
     const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, user, setCurrentUser, profileUpdated, setProfileUpdated] = useOutletContext();


  //check if the e-mail address user puts is invalid
  const [invalidEmail, setInvalidEmail] = useState(false); 

  
 return ( <>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <div>
            <Typography variant="h4">
              Profile
            </Typography>
          </div>
          <div>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={6}
                lg={4}
              >
                <AccountProfile 
                user={user}
                setProfileUpdated={setProfileUpdated}
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
                lg={8}
              >
                <AccountProfileDetails 
                user={user}
                setCurrentUser={setCurrentUser}
                setSnackbarOpen={setSnackbarOpen}
                invalidEmail={invalidEmail}
                setInvalidEmail={setInvalidEmail}
                setSnackbarOpenCondition={setSnackbarOpenCondition}
                snackbarOpenCondition={snackbarOpenCondition}
                profileUpdated={profileUpdated}
                setProfileUpdated={setProfileUpdated}

                />
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
  
  <Snackbar
  snackbarOpenCondition={snackbarOpenCondition}
  snackbarOpen={snackbarOpen}
  setSnackbarOpen={setSnackbarOpen}
  invalidEmail={invalidEmail}
  />
    </Box>
  </>);
}


export default Profile;

