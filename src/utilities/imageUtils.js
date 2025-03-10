//utilities for image handling, uploading and processing
import { useState } from 'react';
import { validateImageType, validateImageSize } from './formValidation';
import { uploadProfilePicture, sendImageMessage } from './api';

//convert file to base64 for preview
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

//create form data for image upload
export function createImageFormData(image, userId, additionalData = {}) {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("userId", userId);
  
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
  });
  
  return formData;
}

//hook to manage image upload functionality
export function useImageUpload(setSnackbarOpenCondition, setSnackbarOpen) {
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  //handle file selection and validation
  const handleImageSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return false;
    
    //check the filetype to ensure it's an image and validate size
    if (!validateImageType(selectedFile)) {
      console.error("Only image files can be attached!");
      setSnackbarOpenCondition("notAnImage");
      setSnackbarOpen(true);
      return false;
    }
    
    if (!validateImageSize(selectedFile)) {
      console.error("Image size is too big!");
      setSnackbarOpenCondition("sizeTooBig");
      setSnackbarOpen(true);
      return false;
    }
    
    setImageFile(selectedFile);
    return true;
  };

  //upload profile image
  async function uploadProfileImage (userId, formData, onSuccess){
    if (!imageFile || !userId) return false;
    
    setIsUploading(true);
    
    try {
      const response = await uploadProfilePicture(userId, formData);
      
      setImageFile(null);
      setIsUploading(false);
      setUploadSuccess(true);
      
      if (onSuccess) onSuccess();
      return response; //return the server response containing updated user data
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      return false;
    }
  }

  //send image message
  async function sendImage (currentUser, selectedPerson, onSuccess){
    if (!imageFile || !currentUser || !selectedPerson) return false;
    
    setIsUploading(true);
    
    try {
      await sendImageMessage(imageFile, currentUser, selectedPerson);
      
      setImageFile(null);
      setIsUploading(false);
      setUploadSuccess(true);
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error sending image:', error);
      setIsUploading(false);
      return false;
    }
  }

  //reset upload state
  async function resetUpload() {
    setImageFile(null);
    setIsUploading(false);
    setUploadSuccess(false);
  }

  return {
    imageFile,
    setImageFile,
    isUploading,
    uploadSuccess,
    handleImageSelect,
    uploadProfileImage,
    sendImage,
    resetUpload
  };
}

//validate image and handle UI feedback
export function handleImageValidation(file, setSnackbarOpenCondition, setSnackbarOpen) {
  //check the filetype to ensure it's an image
  if (!validateImageType(file)) {
    console.error("Only image files can be attached!");
    setSnackbarOpenCondition("notAnImage");
    setSnackbarOpen(true);
    return false;
  }
  
  //check if image size is > 1mb
  if (!validateImageSize(file)) {
    console.error("Image size is too big!");
    setSnackbarOpenCondition("sizeTooBig");
    setSnackbarOpen(true);
    return false;
  }
  
  return true;
}