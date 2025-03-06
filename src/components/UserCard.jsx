/* eslint-disable react/prop-types */
import {useNavigate } from "react-router-dom";
import CardActions from '@mui/joy/CardActions';
import IconButton from '@mui/joy/IconButton';
import * as Icon from 'react-bootstrap-icons';
import '../styles/UserCard.css'
import MuiAvatar from "./MuiAvatar.jsx";
import { useContext, useEffect} from 'react';
import { UserContext } from '../contexts/UserContext.jsx';



export default function UserCard({person}) {

  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson, theme } = useContext(UserContext); 

  const navigate = useNavigate(); 

  function handleSendMessageClick(){
    setSelectedPerson(person)
    navigate("/"); 
  }


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
      </div>
    </div>
  );
}