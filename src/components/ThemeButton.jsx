/* eslint-disable react/prop-types */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import * as Icon from 'react-bootstrap-icons';
import '../styles/ThemeButton.css'
import MuiAvatar from "../components/MuiAvatar.jsx";


const ThemeButton = ({setTheme, theme}) => {

  
  const [activeThemeIcon, setActiveThemeIcon] = useState("");


  function handleThemeChange (event) {
    console.log (event.target.name)
    console.log (event.target.value)
    setTheme(event.target.value)
  }

  //changing the theme by altering the data-bs-theme attribute in index.html
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  //changing the active theme icon everytime the theme changes
    useEffect(() => {
      if(theme==="light"){
        setActiveThemeIcon("bi-sun-fill")
      } else if(theme==="dark"){
        setActiveThemeIcon("bi-moon-stars-fill")
      } else if(theme==="auto"){
        setActiveThemeIcon("bi-circle-half")
      }
      
    }, [theme]);


    return (
      <>
    <div className="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
      <button className="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (dark)">
        <div className="active-icon-container"><i id="activeIcon1" className={`my-1 theme-icon-active bi ${activeThemeIcon}`}></i></div>
        <span className="visually-hidden" id="bd-theme-text">Toggle theme</span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text">
        <li>
          <button 
          type="button" 
          name="lightBtn" 
          value="light" 
          onClick={handleThemeChange}
          className={`dropdown-item d-flex align-items-center ${theme === 'light' ? 'active' : ''}`} 
          data-bs-theme-value="light" 
          aria-pressed="false">
            <i className="me-2 opacity-50 theme-icon bi bi-sun-fill"></i>
            
            Light
            <svg className="bi ms-auto d-none" width="1em" height="1em"><i className="bi bi-check2 d-none"></i></svg>
          </button>
        </li>
        <li>
          <button 
          type="button" 
          name="darkBtn"
          value="dark"
          onClick={handleThemeChange}
          className={`dropdown-item d-flex align-items-center ${theme === 'dark' ? 'active' : ''}`} 
          data-bs-theme-value="dark" 
          aria-pressed="false">
           <i width="1em" height="1em" className="me-2 opacity-50 theme-icon bi bi-moon-stars-fill"></i>
            Dark
            <svg className="bi ms-auto d-none" width="1em" height="1em"><i className="bi bi-check2 d-none"></i></svg>
          </button>
        </li>
        <li>
          <button 
          type="button" 
          name="autoBtn"
          value="auto"
          onClick={handleThemeChange}
          className={`dropdown-item d-flex align-items-center ${theme === 'auto' ? 'active' : ''}`} 
          data-bs-theme-value="auto" 
          aria-pressed="false">
            <i className="me-2 opacity-50 theme-icon bi bi-circle-half"></i>
            Auto
            <svg className="bi ms-auto d-none" width="1em" height="1em"><i className="bi bi-check2 d-none"></i></svg>
          </button>
        </li>
      </ul>
    </div>

    </>
      );
    };
    
    
export default ThemeButton;