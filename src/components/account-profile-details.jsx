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
  const [profileUpdated, setProfileUpdated] = useState(false);

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
        setInvalidEmail(false)
        }
        else{
        setInvalidEmail(true)  
        }
  }, [values.email]);


  function handleSubmit (event) {
    event.preventDefault();
    console.log("submitted this shit")
    setProfileUpdated(true)
  }


    /* effect for submitting the profile changes */
    useEffect(() => {
        console.log("let's begin")
        async function editProfile() {
            //on submit, clean the word with the profanity cleaner package
            //https://www.npmjs.com/package/profanity-cleaner
            /* let input = await clean(nameInput, { keepFirstAndLastChar: true }) */

            console.log("useffect activated ")

            let result = await fetch(
            'http://localhost:5000/editprofile/' + user["_id"], {
                method: 'PATCH',
                body: JSON.stringify({ name: values.name, email: values.email, bio: values.bio}), 
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                }
            })
            result = await result.json();
            console.warn(result);
            if (result) {
                console.log("Message sent");

                setProfileUpdated(false);
            }   
        }
        /* only trigger when message is sent */
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
              <Grid
                xs={12}
                md={12}
              >
                <TextField
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
          variant="contained"
          onClick={handleSubmit}>
            Save details
          </Button>

        </CardActions>
      </Card>
    </form>
  );
};