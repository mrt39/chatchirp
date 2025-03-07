/* eslint-disable react/prop-types */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import '../styles/Navbar.css';
import MuiAvatar from "../components/MuiAvatar.jsx";
import LogoImg from "../assets/logo.png";
import { logoutUser } from '../utilities/auth';

const Navbar = ({user, setCurrentUser}) => {
  const [currentRoute, setcurrentRoute] = useState(useLocation())
  var location = useLocation();
  const navigate = useNavigate(); 

  useEffect(() => {
    setcurrentRoute(location.pathname)
  }, [location]); //only re-run the effect if count changes

  async function handleSignOut() {
    try {
      await logoutUser();
      await setCurrentUser(null);
      navigate('/login'); //route to /login upon successful logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  return (
    <>
      <div className="d-flex flex-column flex-shrink-0 bg-body-tertiary" style={{width: "4.5rem"}}>
        <div className="navbarLogo">
          <img src={LogoImg} alt="logo" />
        </div>
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
        </ul>
        <div className="dropdown border-top">
          <a href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <div className="navbarAvatar">
              <MuiAvatar user={user} />
            </div>
          </a>
          <ul className="dropdown-menu text-small shadow">
            <li><a className="dropdown-item" href="#" onClick={handleSignOut}>Sign out</a></li>
          </ul>
        </div>
      </div>
    </>
  );
};
    
export default Navbar;