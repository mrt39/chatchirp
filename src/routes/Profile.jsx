/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import AccountProfile from '../components/AccountProfile';
import AccountProfileDetails from '../components/AccountProfileDetails';
import Snackbar from "../components/Snackbar.jsx";
import "../styles/Profile.css";

export default function Profile() {
  return (
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
                <AccountProfile />
              </Grid>
              <Grid
                xs={12}
                md={6}
                lg={8}
              >
                <AccountProfileDetails />
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
      <Snackbar />
    </Box>
  );
}