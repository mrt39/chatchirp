import {useNavigate } from "react-router-dom";
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



export default function UserCard({person, selectedPerson, setSelectedPerson}) {

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
      <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Avatar src={person.uploadedpic? "http://localhost:5000/images/" + person.uploadedpic : person.picture} sx={{ '--Avatar-size': '4rem' }} />

        <Typography level="title-lg">{person.name}</Typography>
        <Typography level="body-sm" sx={{ maxWidth: '24ch' }}>
{/*             {person.bio? person.bio : null} */}
        {person.bio}
        </Typography>
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
        <IconButton onClick={handleSendMessageClick} size="sm" variant="plain" color="neutral">
                <Icon.SendFill  className="bi pe-none" width="24" height="24" aria-label="Message"/>
        </IconButton>
        </div>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}