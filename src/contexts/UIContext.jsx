/* eslint-disable react/prop-types */
import { createContext, useState, useContext } from 'react';

//context for managing UI state like snackbars, modals and loading indicators
const UIContext = createContext();

export function UIProvider({ children }) {
  //snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenCondition, setSnackbarOpenCondition] = useState();
  
  //form validation states
  const [invalidEmail, setInvalidEmail] = useState(false);
  
  return (
    <UIContext.Provider 
      value={{
        snackbarOpen,
        setSnackbarOpen,
        snackbarOpenCondition,
        setSnackbarOpenCondition,
        invalidEmail,
        setInvalidEmail
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

//custom hook for using the UI context
export function useUI() {
  return useContext(UIContext);
}