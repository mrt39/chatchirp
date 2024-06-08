/* eslint-disable react/prop-types */
import {
    Button,
    Card,
    CardActions,
  } from '@mui/material';
  import { useState, useEffect } from 'react';
  import { useOutletContext } from "react-router-dom";
  import "../styles/Account-Profile.css"
  import MuiAvatar from "./MuiAvatar";
  import Snackbar from "./Snackbar.jsx"

  
  
  export const AccountProfile = ({user, setProfileUpdated}) => {

    const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen] = useOutletContext();


    const [uploadedImg, setUploadedImg] = useState();

    const [imgSubmitted, setImgSubmitted] = useState(false);


    function handleChange(event){
      const uploadedImg = event.target.files[0]
      //check the filetype to ensure it's an image. throw error if it isn't
      if (uploadedImg["type"] != "image/x-png" && uploadedImg["type"] != "image/png" && uploadedImg["type"] != "image/jpeg") {
        console.error("Only image files can be attached!")
        setSnackbarOpenCondition("notAnImage")
        setSnackbarOpen(true)
        return
        //if image size is > 1mb, throw error
      }else if(uploadedImg["size"] > 1048576){
        console.error("Image size is too big!")
        setSnackbarOpenCondition("sizeTooBig")
        setSnackbarOpen(true)
        return
      }else{
      setUploadedImg(event.target.files[0]);
      }
    }

    function submitImg(){
      setImgSubmitted(true)
    }

     /* effect for handling uploading img */
     useEffect(() => {
      async function changeProfileImage() {       

        const formData = new FormData()
        formData.append("image", uploadedImg)

          fetch('http://localhost:5000/uploadprofilepic/' + user["_id"], {
              method: "post",
              body: formData, 
              headers: {
                  "Access-Control-Allow-Origin": "*",
              }
          })
          .then(async result =>{
           if (result.ok){
            let response = await result.json();
            console.warn(response)
            console.log("Image uploaded");
            setUploadedImg();
            setImgSubmitted(false);
            setProfileUpdated(true)
           } else{
            throw new Error(result);
           }
          })
          .catch(error => {
            console.error('Error:', error);
          });

      }
      /* only trigger when message is sent */
      if (imgSubmitted ===true){
        changeProfileImage();
      } 
  }, [imgSubmitted]);


      return (
        <Card>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex flex-column align-items-center text-center profileAvatar">
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