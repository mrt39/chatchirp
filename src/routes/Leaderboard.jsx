/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'

const Leaderboard = () => {

    {/* "useOutletContext" is how you get props from Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
    const [scene] = useOutletContext();


    return (
        <div className='leaderboardContainer'>
                <h1>This is the leaderboard!</h1>
        </div>
      );
    };
    
    
export default Leaderboard;