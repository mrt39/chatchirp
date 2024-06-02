/* eslint-disable react/prop-types */
import {useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import ButtonGroup from '@mui/joy/ButtonGroup';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import CardActions from '@mui/joy/CardActions';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import SvgIcon from '@mui/joy/SvgIcon';
import * as Icon from 'react-bootstrap-icons';
import '../styles/UserCard2.css'
import MuiAvatar from "./MuiAvatar";
import { useContext } from 'react';
import { UserContext } from '../App.jsx';



export default function UserCard2({person}) {

    // Passing the UserContext defined in app.jsx
    const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

 
    const navigate = useNavigate(); 

    function handleSendMessageClick(){

        setSelectedPerson(person)
        navigate("/"); 
    }

  return (
<>
{/*       <CardContent sx={{ alignItems: 'center', textAlign: 'center'  }}>
        <div className="userCardAvatar">
          <MuiAvatar 
          user={person}/>
        </div>
        <Typography level="title-lg">{person.name}</Typography>
        {person.email? 
        <Typography 
          color="text.secondary"
          variant="body1"
        >
        {person.email}
        </Typography>
        :null}

        {person.bio?  
        <Typography level="body-sm" sx={{ textOverflow: 'ellipsis'}}>
        {person.bio}
        </Typography>
        : null} 

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 2,
            '& > button': { borderRadius: '2rem' },
          }}
        >
        </Box>
      </CardContent> */}
      <article className="profile">
      <div className="userCardAvatar">
          <MuiAvatar 
          user={person}/>
        </div>
	<h2 className="profile-username">{person.name}</h2>
	<small className="profile-user-handle">{person.email}</small>
	<div className="profile-actions">
		<button className="btn btn--primary">Follow</button>
		<button className="btn btn--icon">
			<i className="ph-export"></i>
		</button>
		<button className="btn btn--icon">
			<i className="ph-dots-three-outline-fill"></i>
		</button>
	</div>
    {person.bio?  
        <Typography level="body-sm" sx={{ textOverflow: 'ellipsis'}}>
        {person.bio}
        </Typography>
        : null} 
</article>
      
{/*       <CardOverflow sx={{ bgcolor: 'background.level1' }}>
        <CardActions buttonFlex="1">
        <div href="#" title="Message this person!" >
        <IconButton className="userCardIconButton" onClick={handleSendMessageClick} size="sm" variant="plain" color="neutral">
            <Icon.SendFill  className="bi pe-none" width="24" height="24" aria-label="Message"/>
            <p>Say Hi!</p>
        </IconButton>
        </div>
        </CardActions>
      </CardOverflow> */}
</>
  );
}