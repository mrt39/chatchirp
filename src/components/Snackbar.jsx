import * as React from 'react';
import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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

/*   function snackBarType (){
    if (snackbarOpenCondition === "wrongEmail"){
        return (<Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    Invalid e-mail!
                </Alert>)
    }else if (snackbarOpenCondition === "success"){
        return (<Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                Invalid e-mail!
                </Alert>)

    }else if  (snackbarOpenCondition === "failure"){
        return (<Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                   There has been an error.
                </Alert>)
    }
  } */

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Button variant="outlined" onClick={handleClick}>
        Open success snackbar
      </Button>
      <Snackbar 
      open={snackbarOpen} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center'}}
>
    {snackbarOpenCondition == "success"?
    <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        Details saved successfully!
    </Alert>
    :
    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
       {snackbarOpenCondition=="wrongEmail"?  "Invalid e-mail!": "There has been an error."} 
    </Alert>
    }

      </Snackbar>
    </Stack>
  );
}