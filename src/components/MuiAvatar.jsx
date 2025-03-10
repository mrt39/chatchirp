/* eslint-disable react/prop-types */
import Avatar from '@mui/material/Avatar';
import '../styles/MuiAvatar.css';
import { useMemo } from 'react';

//cached color values for string inputs
//this object persists between renders and acts as a simple memoization cache outside React's lifecycle
//it stores previously calculated colors to avoid recalculating the same values repeatedly
const colorCache = {};

//generate a color based on a string
function stringToColor(string) {
  //check the cache first before calculating, whether there is a color that exists for that user
  //color generation involves multiple mathematical operations
  //that would otherwise run repeatedly for the same usernames across the application
  if (colorCache[string]) {
    return colorCache[string];
  }
  
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
  
  //store in cache for future use - this makes subsequent renders much faster
  //especially important as avatars appear in multiple places (messages, contacts, etc.)
  colorCache[string] = color;
  return color;
}

//generate avatar properties based on a name
function stringAvatar(name) {
  return {
    children: name.includes(" ")
      ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
      : `${name[0]}`
  };
}

export default function MuiAvatar({ user, profilePageAvatar }){
  //useMemo is used here to calculate and store the avatar properties
  //this prevents recalculating these properties on every render
  //particularly important since avatars are rendered in many places throughout the app
  //and avatar prop creation requires conditional logic and multiple operations
  const avatarProps = useMemo(() => {
    //this calculation happens only when user info or profilePageAvatar setting changes
    //not on every render cycle, which saves  computation across the app
    if (user.uploadedpic || user.picture) {
      return {
        src: user.uploadedpic ? user.uploadedpic : user.picture,
        imgProps: { referrerPolicy: "no-referrer" },
        sx: profilePageAvatar ? { width: 150, height: 150 } : { width: 50, height: 50 }
      };
    } else {
      return {
        ...stringAvatar(user.name),
        sx: profilePageAvatar
          ? { bgcolor: stringToColor(user.name), width: 150, height: 150 }
          : { bgcolor: stringToColor(user.name), width: 50, height: 50 }
      };
    }
  }, [user.name, user.uploadedpic, user.picture, profilePageAvatar]); //dependencies for recalculation

  //if user has uploaded pic or Google profile pic, use it. Otherwise, create an avatar from initials.
  if (user.uploadedpic || user.picture) {
    return (
      <Avatar 
        src={avatarProps.src}
        imgProps={avatarProps.imgProps}
        sx={avatarProps.sx}
      />
    );
  } else {
    return (
      <Avatar 
        {...stringAvatar(user.name)}  
        sx={avatarProps.sx}
      />
    );
  }
}