/* eslint-disable react/prop-types */
import Avatar from '@mui/material/Avatar';
import '../styles/MuiAvatar.css'

/* give hash color to a word */
function stringToColor(string) {
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
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: 
    /* if there are multiple words in name */
    name.includes(" ")?
    `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
    : 
    `${name[0]}`
  };
}

export default function MuiAvatar({user, profilePageAvatar}) {
  return (
    /* if the user has an uploadedpic or picture(from google), use it. otherwise, create an avatar from the initials and color algorithm above. */
       user.uploadedpic || user.picture? 
       <Avatar src={user.uploadedpic? "http://localhost:5000/images/" + user.uploadedpic : user.picture} 
       //referrerPolicy is required to GET the images from google database without an error.
       imgProps={{ referrerPolicy: "no-referrer" }} 
       sx={profilePageAvatar? { width: 150, height: 150 } :{ width: 50, height: 50 }}
       />
        :
        <Avatar {...stringAvatar(user.name)}  
          sx={profilePageAvatar? { width: 150, height: 150 } :{ width: 50, height: 50 }}
        />
        
  );
}