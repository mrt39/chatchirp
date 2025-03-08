// utility functions for theme management

import { useState, useEffect } from 'react';

// get the theme from localstorage
export function getStoredTheme() { 
  return localStorage.getItem('theme') || 'light'; 
}

// set the theme in localstorage
export function setStoredTheme(theme) { 
  localStorage.setItem('theme', theme); 
}

// apply theme to document
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  // changes the background color of body to aliceblue with light color toggle
  document.body.className = theme === 'light' ? 'light-theme' : "";
}

// get appropriate icon class for the active theme
export function getThemeIconClass(theme) {
  return theme === "light" ? "bi-sun-fill" : "bi-moon-stars-fill";
}

//hook to manage theme
export function useTheme() {
  //load the theme from localstorage so that the user selection persists. use light theme as default.
  const savedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(savedTheme);

  //change the theme by altering the data-bs-theme attribute in index.html
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    //changes the background color of body to aliceblue with light color toggle. css in app.css
    document.body.className = theme === 'light' ? 'light-theme' : "";
    
    //save the theme to localstorage so that the user selection persists
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme];
}