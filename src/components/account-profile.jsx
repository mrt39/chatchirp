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
              <div className="card">
                <div className="card-body">
                  <div className="d-flex flex-column align-items-center text-center">
                    <MuiAvatar
                    user={user}
                    profilePageAvatar="yes"
                    />                  
                    <div className="mt-3">
                      <h4>{user.name}</h4>
                      <p className="text-secondary mb-1">{user.email}</p>
                      <p className="text-muted font-size-sm">{user.bio}</p>
                    </div>
                  </div>
                </div>
              </div>
       <CardActions>

{/*           <input 
          disabled = {user.email === "demoacc@demoacc.com" ? true : false}
          type="file" 
          className="imageInput btn btn-primary"
          value=""
          id="image" 
          name="image" 
          accept="image/*"
          onChange={handleChange}/> */}



          <input 
          disabled = {user.email === "demoacc@demoacc.com" ? true : false}
          type="file" 
          className="hidden"
          value=""
          id="image" 
          name="image" 
          accept="image/*"
          onChange={handleChange}/>

          {/* hide the input field and choose  a label for the functionality because input brings its own embedded css, easier to modify label*/}
          <Button 
          variant="contained"
          disabled = {user.email === "demoacc@demoacc.com" ? true : false}
          >
            <label htmlFor="image" className="imgLbl">Choose an Image</label>

          </Button>

          <Button 
          disabled = {user.email === "demoacc@demoacc.com" ? true : false}
          variant="contained"
          onClick={submitImg}
          >
            Submit
          </Button>
        
      </CardActions>
      </Card>
    )
};