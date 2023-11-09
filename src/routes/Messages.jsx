/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'

const Messages = () => {

    {/* "useOutletContext" is how you get props from Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
    const [scene] = useOutletContext();

    return (
        <div className='HomePageContainer'>
                <h1>This is the HomePage!</h1>
        </div>
      );
    };
    
    
export default Messages;