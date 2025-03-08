//validate email format
export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

//validate image file type
export function validateImageType(file) {
  const validTypes = ["image/x-png", "image/png", "image/jpeg"];
  return validTypes.includes(file.type);
}

//validate image size (in bytes)
export function validateImageSize(file, maxSize = 1048576) { // 1MB default
  return file.size <= maxSize;
}

//validate password strength
export function validatePassword(password) {
  //At least 8 characters, at least one letter and one number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
}

//validate form fields
export function validateForm(formData, requiredFields) {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!formData[field]) {
      errors[field] = 'This field is required';
    }
  });
  
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (formData.password && formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return errors;
}

//handle image validation for uploads
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