/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from 'react';
import { 
  getStoredTheme, 
  setStoredTheme, 
  applyTheme 
} from '../utilities/theme';

//context for managing application theme
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  //load the theme from localstorage so that the user selection persists. use light theme as default.
  const savedTheme = getStoredTheme();
  const [theme, setTheme] = useState(savedTheme);

  //change the theme by altering the data-bs-theme attribute in index.html
  useEffect(() => {
    applyTheme(theme);
    //save the theme to localstorage so that the user selection persists
    setStoredTheme(theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

//custom hook for using theme context
export function useThemeContext() {
  return useContext(ThemeContext);
}