// utility functions for theme management

// get the theme from localstorage
export const getStoredTheme = () => localStorage.getItem('theme') || 'light';

// set the theme in localstorage
export const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

// apply theme to document
export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-bs-theme', theme);
  // changes the background color of body to aliceblue with light color toggle
  document.body.className = theme === 'light' ? 'light-theme' : "";
};

// get appropriate icon class for the active theme
export const getThemeIconClass = (theme) => {
  return theme === "light" ? "bi-sun-fill" : "bi-moon-stars-fill";
};