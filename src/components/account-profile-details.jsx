import { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid
} from '@mui/material';


export const AccountProfileDetails = ({user}) => {

  const [invalidEmail, setInvalidEmail] = useState(false); 

  const [values, setValues] = useState({
    name: user.name,
    email: user.email,
  });

  function handleChange (event) {
      setValues({
        ...values,
        [event.target.name]: event.target.value
  });
  }

  useEffect(() => {
    if(values.email.includes("@")){
        setInvalidEmail(false)
        }
        else{
        setInvalidEmail(true)  
        }
  }, [values.email]);


  function handleSubmit (event) {
    event.preventDefault();
    console.log("submitted this shit")
  }

 
  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader
          title="Details"
        />
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

            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button 
          variant="contained"
          onClick={handleSubmit}>
            Save details
          </Button>

        </CardActions>
      </Card>
    </form>
  );
};