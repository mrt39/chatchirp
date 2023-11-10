/* eslint-disable react/prop-types */
import { useOutletContext} from "react-router-dom";
import { useState, useEffect } from 'react'

const Profile = ({user}) => {

    return (
        <div className='leaderboardContainer'>
                <h1>This is the {user.googleId}!</h1>
        </div>
      );
    };
    
    
export default Profile;