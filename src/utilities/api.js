// functions for making API calls to the backend

// get current logged in user data
export const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/success`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  // get user profile data from database
  export const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/${userId}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  // logout user
  export const logoutUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  // get contacts for message box
  export const fetchContacts = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/messagebox/${userId}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  // get messages between two users
  export const fetchMessages = async (userId, selectedPersonId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/messagesfrom/${userId}_${selectedPersonId}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  // send a message
  export const sendMessage = async (from, to, message) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/messagesent`, {
        method: "post",
        body: JSON.stringify({ from, to, message }), 
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include"
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  // update user profile
  export const updateProfile = async (userId, userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/editprofile/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(userData), 
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Network response was not ok.');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };