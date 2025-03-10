/* eslint-disable react/prop-types */
import {
  Button,
  Card,
  CardActions,
} from '@mui/material';
import { useState } from 'react';
import "../styles/AccountProfile.css"
import MuiAvatar from "./MuiAvatar.jsx";
import Snackbar from "./Snackbar.jsx"
import { createImageFormData } from '../utilities/imageUtils';
import { useImageUpload } from '../utilities/imageUtils';
import { useUI } from '../contexts/UIContext';
import { useAuthorization } from '../contexts/AuthorizationContext';
import { useUser } from '../contexts/UserContext';

export default function AccountProfile() {
  const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen } = useUI();
  const { currentUser, setCurrentUser } = useAuthorization();
  const { setProfileUpdated } = useUser();
  
  //use the centralized image upload hook
  const { 
    imageFile, 
    handleImageSelect, 
    isUploading, 
    uploadProfileImage 
  } = useImageUpload(setSnackbarOpenCondition, setSnackbarOpen);

  function handleChange(event) {
    handleImageSelect(event);
  }

  async function submitImg() {
    //create form data here to pass userId directly
    const formData = createImageFormData(imageFile, currentUser._id);
    
    const updatedUser = await uploadProfileImage(currentUser._id, formData, () => {
      //callback when upload is complete
      setProfileUpdated(true);
    });

    // Update the currentUser state with the new profile picture
    if (updatedUser && updatedUser.uploadedpic) {
      setCurrentUser({
        ...currentUser,
        uploadedpic: updatedUser.uploadedpic
      });
    }
  }

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
          disabled={currentUser.email === "demoacc@demoacc.com" || isUploading ? true : false}
        >
          <label htmlFor="image" className="imgLbl">Choose an Image</label>
        </Button>
        <Button 
          disabled={currentUser.email === "demoacc@demoacc.com" || !imageFile || isUploading ? true : false}
          variant="contained"
          onClick={submitImg}
        >
          Submit
        </Button>
      </CardActions>
    </Card>
  );
}