//utility functions for authentication and user management

import { fetchAPI } from './api';

//login with credentials
export async function loginWithCredentials(loginData) {
  return fetchAPI('/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
    credentials: 'include'
  });
}

//login with google
export function loginWithGoogle() {
  window.open(import.meta.env.VITE_BACKEND_URL + "/auth/google", "_self");
}

//sign up with credentials
export async function signUpWithCredentials(signUpData) {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify(signUpData),
    credentials: 'include'
  });
}

//login with demo account
export async function loginWithDemo() {
  return fetchAPI('/demoacclogin', {
    method: 'GET',
    credentials: 'include'
  });
}

//logout user
export async function logoutUser() {
  return fetchAPI('/logout', {
    method: 'POST',
    credentials: 'include'
  });
}