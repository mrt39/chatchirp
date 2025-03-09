/* eslint-disable react/prop-types */
import {
  Button,
  Card,
  CardActions,
} from '@mui/material';
import { useState, useEffect } from 'react';
import "../styles/AccountProfile.css"
import MuiAvatar from "./MuiAvatar.jsx";
import Snackbar from "./Snackbar.jsx"
import { handleImageValidation } from '../utilities/formValidation';
import { uploadProfilePicture } from '../utilities/api';
import { useUI } from '../contexts/UIContext';
import { useAuthorization } from '../contexts/AuthorizationContext';

export default function AccountProfile() {
  const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen } = useUI();
  const { currentUser, setProfileUpdated } = useAuthorization();

  const [uploadedImg, setUploadedImg] = useState();
  const [imgSubmitted, setImgSubmitted] = useState(false);

  function handleChange(event){
    const uploadedImg = event.target.files[0]
    //check the filetype to ensure it's an image. throw error if it isn't
    if (!handleImageValidation(uploadedImg, setSnackbarOpenCondition, setSnackbarOpen)) {
      return;
    } else {
      setUploadedImg(event.target.files[0]);
    }
  }

  function submitImg(){
    setImgSubmitted(true)
  }

  //effect for handling uploading image
  useEffect(() => {
    async function changeProfileImage() {       
      const formData = new FormData()
      formData.append("image", uploadedImg)

      try {
        await uploadProfilePicture(currentUser["_id"], formData);
        console.log("Image uploaded");
        setUploadedImg(null);
        setImgSubmitted(false);
        setProfileUpdated(true);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    //only trigger when image is sent
    if (imgSubmitted && uploadedImg){
      changeProfileImage();
    } 
  }, [imgSubmitted, uploadedImg, currentUser, setProfileUpdated]);

  return (
    <Card>
      <div className="card">
        <div className="card-body">
          <div className="d-flex flex-column align-items-center text-center profileAvatar">
            <MuiAvatar
              user={currentUser}
              profilePageAvatar="yes"
            />                  
            <div className="mt-3">
              <h4>{currentUser.name}</h4>
              <p className="text-secondary mb-1">{currentUser.email}</p>
              <p className="text-muted font-size-sm">{currentUser.bio}</p>
            </div>
          </div>
        </div>
      </div>
      <CardActions className='accountProfileCardActions'>
        <input 
          disabled={currentUser.email === "demoacc@demoacc.com" ? true : false}
          type="file" 
          className="hidden"
          value=""
          id="image" 
          name="image" 
          accept="image/*"
          onChange={handleChange}
        />
        {/* hide the input field and choose a label for the functionality, as input brings its own embedded css, easier to modify label*/}
        <Button 
          variant="contained"
          disabled={currentUser.email === "demoacc@demoacc.com" ? true : false}
        >
          <label htmlFor="image" className="imgLbl">Choose an Image</label>
        </Button>
        <Button 
          disabled={currentUser.email === "demoacc@demoacc.com" || !uploadedImg ? true : false}
          variant="contained"
          onClick={submitImg}
        >
          Submit
        </Button>
      </CardActions>
    </Card>
  );
}