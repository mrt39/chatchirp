/* eslint-disable react/prop-types */
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    Typography
  } from '@mui/material';
  import { useState, useEffect } from 'react';
  import "../styles/Account-Profile.css"
  import MuiAvatar from "./MuiAvatar";
  
  
  export const AccountProfile = ({user, setProfileUpdated}) => {

    const [uploadedImg, setUploadedImg] = useState();

    const [imgSubmitted, setImgSubmitted] = useState(false);

    function handleChange(event){
      console.log(event.target.files);
      setUploadedImg(event.target.files[0]);
    }

    function submitImg(){
      setImgSubmitted(true)
    }

     /* effect for handling uploading img */
     useEffect(() => {
      async function postMessage() {       

        const formData = new FormData()
        formData.append("image", uploadedImg)

          let result = await fetch(
          'http://localhost:5000/uploadprofilepic/' + user["_id"], {
              method: "post",
              body: formData, 
              headers: {
                  "Access-Control-Allow-Origin": "*",
              }
          })
          result = await result.json();
          console.warn(result);
          if (result) {
              console.log("Image uploaded");
              setUploadedImg();
              setImgSubmitted(false);
              setProfileUpdated(true)
          }   
      }
      /* only trigger when message is sent */
      if (imgSubmitted ===true){
      postMessage();
      } 
  }, [imgSubmitted]);


      return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="profileAvatar">
            <MuiAvatar
              user={user}
            />
          </div>

          <Typography
            gutterBottom
            variant="h5"
          >
            {user.name}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body1"
          >
            {user.email}
          </Typography>
          <br />
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {user.bio}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
       <CardActions>
        <Button
          fullWidth
          variant="text"
        >
            Upload Picture
          </Button>
          <input 
          type="file" 
          value=""
          id="image" 
          name="image" 
          accept="image/*"
          onChange={handleChange}/>

          <button onClick={submitImg}>SUBMIT</button>
        
      </CardActions>
    </Card>
    )
};