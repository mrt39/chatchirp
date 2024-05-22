/* eslint-disable react/prop-types */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import * as Icon from 'react-bootstrap-icons';
import '../styles/Navbar.css'
import MuiAvatar from "../components/MuiAvatar.jsx";


const Navbar = ({user, setCurrentUser}) => {

  const [currentRoute, setcurrentRoute] = useState(useLocation())

  var location = useLocation();

  useEffect(() => {
    setcurrentRoute(location.pathname)
  }, [location]); // Only re-run the effect if count changes


  const navigate = useNavigate(); // Get the navigate function

  
  function handleSignOut(){
      fetch('http://localhost:5000/logout',{
      method: 'POST',
      credentials: 'include' // sends cookies to server
      })
      .then(async result => {
        if (result.ok) {
          let response = await result.json(); 
          console.warn(response); 
          await setCurrentUser(null)
          navigate('/login'); // Route to /login upon successful logout
        } else {
          throw new Error(result);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
 
  }


    return (
      <>
      <div className="d-flex flex-column flex-shrink-0 bg-body-tertiary" style={{width: "4.5rem"}}>
      <a href="/" className="d-block p-3 link-body-emphasis text-decoration-none" title="Icon-only" data-bs-placement="right">
        <svg className="bi pe-none" width="40" height="32"><use xlinkHref="#bootstrap"/></svg>
      </a>
      <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
      <Link to="/">
        <li className="nav-item">
          <div href="#" className={(currentRoute==="/"? "active" :"") + " nav-link py-3 border-bottom rounded-0"} aria-current="page" title="Messages"  data-bs-placement="right">
          <Icon.ChatLeftDots className="bi pe-none" width="24" height="24" aria-label="Messages"/>          
          </div>
        </li>
      </Link>
       <Link to="/profile">
        <li>
          <div href="#" className={(currentRoute==="/profile"? "active" :"") + " nav-link py-3 border-bottom rounded-0"} title="Profile" data-bs-placement="right">
            <Icon.PersonCircle  className="bi pe-none" width="24" height="24" aria-label="Profile"/>
          </div>
        </li>
      </Link>
      <Link to="/findpeople">
        <li>
          <div href="#" className={(currentRoute==="/findpeople"? "active" :"") + " nav-link py-3 border-bottom rounded-0"}  title="Find People!"  data-bs-placement="right">
          <Icon.PeopleFill  className="bi pe-none" width="24" height="24" role="img" aria-label="Find People!"/>
          </div>
        </li>
        </Link>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" title="Products"  data-bs-placement="right">
            <svg className="bi pe-none" width="24" height="24" role="img" aria-label="Products"><use xlinkHref="#grid"/></svg>
          </a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" title="Customers"  data-bs-placement="right">
            <svg className="bi pe-none" width="24" height="24" role="img" aria-label="Customers"><use xlinkHref="#people-circle"/></svg>
          </a>
        </li>
      </ul>
      <div className="dropdown border-top">
        <a href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          {/* <img src={user.uploadedpic? "http://localhost:5000/images/" + user.uploadedpic : user.picture} alt="mdo" width="30" height="30" className="rounded-circle"/> */}
          <div className="navbarAvatar">
          <MuiAvatar
              user={user}
            />
            </div>
        </a>
        <ul className="dropdown-menu text-small shadow">
          <li><a className="dropdown-item" href="#">New project...</a></li>
          <li><a className="dropdown-item" href="#">Settings</a></li>
          <li><a className="dropdown-item" href="/profile">Profile</a></li>
          <li></li>
          <li><a className="dropdown-item" href="#" onClick={handleSignOut}>Sign out</a></li>
        </ul>
      </div>
    </div>
{/*     <ColorModeButton/> */}
    </>
      );
    };
    
    
export default Navbar;