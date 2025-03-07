/* eslint-disable react/prop-types */
import Avatar from '@mui/material/Avatar';
import '../styles/MuiAvatar.css';

// Generate a color based on a string
const stringToColor = (string) => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

// Generate avatar properties based on a name
const stringAvatar = (name) => {
  return {
    children: name.includes(" ")
      ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
      : `${name[0]}`
  };
};

const MuiAvatar = ({ user, profilePageAvatar }) => {
  // If user has uploaded pic or Google profile pic, use it. Otherwise, create an avatar from initials.
  if (user.uploadedpic || user.picture) {
    return (
      <Avatar 
        src={user.uploadedpic ? user.uploadedpic : user.picture} 
        // referrerPolicy is required to GET the images from Google
        imgProps={{ referrerPolicy: "no-referrer" }} 
        sx={profilePageAvatar ? { width: 150, height: 150 } : { width: 50, height: 50 }}
      />
    );
  } else {
    return (
      <Avatar 
        {...stringAvatar(user.name)}  
        sx={profilePageAvatar
          ? { bgcolor: stringToColor(user.name), width: 150, height: 150 }
          : { bgcolor: stringToColor(user.name), width: 50, height: 50 }
        }
      />
    );
  }
};

export default MuiAvatar;