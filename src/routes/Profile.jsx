/* eslint-disable react/prop-types */
import { useOutletContext, useLocation  } from "react-router-dom";
import { useState, useEffect } from 'react'

const Profile = () => {

    {/* "useOutletContext" is how you get props from Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
    const [scene] = useOutletContext();


    const location = useLocation();
    console.log(location.pathname)

    return (
        <div className='leaderboardContainer'>
                <h1>This is the leaderboard!</h1>
        </div>
      );
    };
    
    
export default Profile;