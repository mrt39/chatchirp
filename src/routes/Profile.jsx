/* eslint-disable react/prop-types */
import { useOutletContext} from "react-router-dom";
import { useState, useContext } from 'react'
import { UserContext } from '../contexts/UserContext.jsx';
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { AccountProfile } from '../components/AccountProfile';
import { AccountProfileDetails } from '../components/AccountProfileDetails';
import Snackbar from "../components/Snackbar.jsx"
import "../styles/Profile.css"




const Profile = () => {

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated] = useOutletContext();
  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  //check if the e-mail address user puts is invalid
  const [invalidEmail, setInvalidEmail] = useState(false); 

  
 return ( 
  <>
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
              user={currentUser}
              setProfileUpdated={setProfileUpdated}
              />
              </Grid>
              <Grid
                xs={12}
                md={6}
                lg={8}
              >
                <AccountProfileDetails 
                user={currentUser}
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
  </>
);
}


export default Profile;

