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
          <Avatar
            src={user.uploadedpic? "http://localhost:5000/images/" + user.uploadedpic : user.picture}
            sx={{
              height: 80,
              mb: 2,
              width: 80
            }}
          />
          <Typography
            gutterBottom
            variant="h5"
          >
            {user.name}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {user.email}
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