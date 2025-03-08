/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import '../styles/ThemeButton.css';
import { 
  getThemeIconClass, 
  setStoredTheme, 
  applyTheme 
} from '../utilities/theme';

export default function ThemeButton  ({setTheme, theme})  {
  const [activeThemeIcon, setActiveThemeIcon] = useState(getThemeIconClass(theme));

  function handleThemeChange(event) {
    const newTheme = event.target.value;
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  }

  // Update active theme icon when theme changes
  useEffect(() => {
    setActiveThemeIcon(getThemeIconClass(theme));
  }, [theme]);

  return (
    <>
      <div className="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
        <button className="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label={`Toggle theme (${theme})`}>
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
              aria-pressed={theme === 'light'}
            >
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
              aria-pressed={theme === 'dark'}
            >
              <i width="1em" height="1em" className="me-2 opacity-50 theme-icon bi bi-moon-stars-fill"></i>
              Dark
              <svg className="bi ms-auto d-none" width="1em" height="1em"><i className="bi bi-check2 d-none"></i></svg>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}