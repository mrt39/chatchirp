/* eslint-disable react/prop-types */
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbars({snackbarOpen, setSnackbarOpen, snackbarOpenCondition}) {

  const handleClick = () => {
    setSnackbarOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar 
      open={snackbarOpen} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center'}}
>
    {snackbarOpenCondition=="profileChangeSuccess" || snackbarOpenCondition=="successfulRegister"?
    <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
      {snackbarOpenCondition=="profileChangeSuccess"&&  "Details saved successfully!"} 
      {snackbarOpenCondition=="successfulRegister"&&  "Successfully registered."} 
    </Alert>
    :
    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
       {snackbarOpenCondition=="wrongEmail"&&  "Invalid E-mail!"} 
       {snackbarOpenCondition=="failure"&& "There has been an error."}
       {snackbarOpenCondition=="nameTooLong"&& "Your name can not be longer than 30 characters!"}
       {snackbarOpenCondition=="bioTooLong"&& "Your bio can not be longer than 100 characters!"}
       {snackbarOpenCondition=="emailTooLong"&& "E-mail address can not be longer than 50 characters!"}
       {snackbarOpenCondition=="wrongLoginDeets"&& "Wrong e-mail or password!"}
       {snackbarOpenCondition=="alreadyRegistered"&& "A user with the given e-mail address is already registered!"}
       {snackbarOpenCondition=="notAnImage"&& "Only image files can be attached"}
       {snackbarOpenCondition=="sizeTooBig"&& "Image size is too big!"}
    </Alert>
    }

      </Snackbar>
    </Stack>
  );
}