/* eslint-disable react/prop-types */
import { useOutletContext} from "react-router-dom";
import { useState, useEffect } from 'react'
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { AccountProfile } from '../components/account-profile';
import { AccountProfileDetails } from '../components/account-profile-details';
import "../styles/Profile.css"




const Profile = ({user}) => {
  
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
                />
              </Grid>
              <Grid
                xs={12}
                md={6}
                lg={8}
              >
                <AccountProfileDetails 
                user={user}
                />
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
    </Box>

  </>);
}

/* Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
); */

export default Profile;

/* const Profile = ({user}) => {

    return (
        <div className='leaderboardContainer'>
                <h1>This is the {user.googleId}!</h1>
        </div>
      );
    };
    
    
export default Profile; */