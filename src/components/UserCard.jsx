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
import '../styles/UserCard.css'
import MuiAvatar from "./MuiAvatar.jsx";
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App.jsx';



export default function UserCard({person}) {

    // Passing the UserContext defined in app.jsx
    const { currentUser, selectedPerson, setSelectedPerson, theme } = useContext(UserContext); 

 
    const navigate = useNavigate(); 

    function handleSendMessageClick(){

        setSelectedPerson(person)
        navigate("/"); 
    }

    useEffect(() => {

      console.log(theme)
    }, [theme]);



  return (
    <div className="cardContainer">
        <div className={theme === 'dark' ? 'dark-card-user-image' : 'card-user-image'}>
        <div className="userCardAvatar img-fluid">
          <MuiAvatar 
          user={person}/>
        </div>
        </div>
 
        <div className="cardContent">
            <h4 className="cardName">{person.name}</h4>
            <p className="cardEmail">{person.email}</p>
 
 
 
            <p className="cardBio">
            {person.bio}
            </p>
            <CardActions buttonFlex="1">
            <div href="#" title="Message this person!" >
            <IconButton className="userCardIconButton" onClick={handleSendMessageClick} size="sm" variant="plain" color="neutral">
                <Icon.SendFill  className="bi pe-none" width="24" height="24" aria-label="Message"/>
            </IconButton>
            </div>
            </CardActions>
 
{/*             <a className="effect effect-4" href="#">
                Message Me! 
            </a> */}
        </div>
    </div>
  );
}