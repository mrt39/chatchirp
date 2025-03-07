//utility functions for authentication and user management

import { fetchAPI } from './api';

//login with credentials
export const loginWithCredentials = async (loginData) => {
  return fetchAPI('/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
    credentials: 'include'
  });
};

//login with google
export const loginWithGoogle = () => {
  window.open(import.meta.env.VITE_BACKEND_URL + "/auth/google", "_self");
};

//sign up with credentials
export const signUpWithCredentials = async (signUpData) => {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify(signUpData),
    credentials: 'include'
  });
};

//login with demo account
export const loginWithDemo = async () => {
  return fetchAPI('/demoacclogin', {
    method: 'GET',
    credentials: 'include'
  });
};

//logout user
export const logoutUser = async () => {
  return fetchAPI('/logout', {
    method: 'POST',
    credentials: 'include'
  });
};