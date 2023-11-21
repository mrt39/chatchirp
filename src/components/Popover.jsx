import { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/Popover.css'
import { useEffect } from 'react';


export default function FileInputPopover({popOveranchorEl, setPopOverAnchorEl, setimageSelected, handleImgSendBtn}) {

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false)
    setimageSelected(false);
    setPopOverAnchorEl(null);
  };

    //open popover when an anchor is selected 
    useEffect(() => {
        if (popOveranchorEl){
            setOpen(true)
        }
    }, [popOveranchorEl]);



  return (
    <div>
      <Popover
        open={open}
        anchorEl={popOveranchorEl}
        onClose={handleClose}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          className='popOverClass1'
      >
        <Box className="popOverBox" onClick={handleImgSendBtn} >
        <SendIcon id="popoverSendIcon"/> 
        <Typography sx={{ p: 0.5, fontSize: 14  }}> Send </Typography>
        </Box>
        <Box className="popOverBox" onClick={handleClose}>
        <CloseIcon id="popoverCancelIcon" /> 
        <Typography sx={{ p: 0.5, fontSize: 14 }}> Cancel </Typography>
        </Box>
      </Popover>
    </div>
  );
}