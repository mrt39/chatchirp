/* eslint-disable react/prop-types */
import {useNavigate } from "react-router-dom";
import { useContext } from 'react'
import { UserContext } from '../App.jsx';
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
import '../styles/UserCard.css'
import MuiAvatar from "./MuiAvatar";



export default function UserCard({person}) {

    // Passing the UserContext defined in app.jsx
    const {setSelectedPerson } = useContext(UserContext); 

    const navigate = useNavigate(); 

    function handleSendMessageClick(){

        setSelectedPerson(person)
        navigate("/"); 
    }

  return (
    <Card
      sx={{
        width: 320,
        maxWidth: '100%',
        boxShadow: 'lg',
      }}
    >
      <CardContent sx={{ alignItems: 'center', textAlign: 'center'  }}>
        {/* <Avatar src={person.uploadedpic? "http://localhost:5000/images/" + person.uploadedpic : person.picture} sx={{ '--Avatar-size': '4rem' }} /> */}
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
      </CardContent>
      <CardOverflow sx={{ bgcolor: 'background.level1' }}>
        <CardActions buttonFlex="1">
        <div href="#" title="Message this person!" >
        <IconButton className="userCardIconButton" onClick={handleSendMessageClick} size="sm" variant="plain" color="neutral">
            <Icon.SendFill  className="bi pe-none" width="24" height="24" aria-label="Message"/>
            <p>Say Hi!</p>
        </IconButton>
        </div>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}