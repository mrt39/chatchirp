// functions for making API calls to the backend

//base fetch function for all api calls
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_URL;
    const url = `${baseURL}${endpoint}`;
    
    // default options
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    };
    
    // merge default options with provided options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };
    
    const response = await fetch(url, fetchOptions);
    
    if (response.ok) {
      // only try to parse JSON if there's content to parse
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return true; // for responses with no content
    }
    throw new Error('Network response was not ok.');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// get current logged in user data
export const fetchCurrentUser = async () => {
  return fetchAPI('/login/success', {
    method: 'GET',
    credentials: 'include',
    headers: {
      "Access-Control-Allow-Credentials": true,
    },
  });
};

// get user profile data from database
export const fetchUserProfile = async (userId) => {
  return fetchAPI(`/profile/${userId}`, {
    method: 'GET',
  });
};

// logout user
export const logoutUser = async () => {
  return fetchAPI('/logout', {
    method: 'POST',
    credentials: 'include'
  });
};

// get contacts for message box
export const fetchContacts = async (userId) => {
  return fetchAPI(`/messagebox/${userId}`, {
    method: 'GET',
  });
};

// get messages between two users
export const fetchMessages = async (userId, selectedPersonId) => {
  return fetchAPI(`/messagesfrom/${userId}_${selectedPersonId}`, {
    method: 'GET',
  });
};

// send a message
export const sendMessage = async (from, to, message) => {
  return fetchAPI('/messagesent', {
    method: "post",
    body: JSON.stringify({ from, to, message }), 
    credentials: "include"
  });
};

// update user profile
export const updateProfile = async (userId, userData) => {
  return fetchAPI(`/editprofile/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};

// upload profile picture
export const uploadProfilePicture = async (userId, formData) => {
  return fetchAPI(`/uploadprofilepic/${userId}`, {
    method: "post",
    body: formData, 
    headers: {
      // Don't set Content-Type when sending FormData, browser will set it with boundary
      "Content-Type": undefined
    }
  });
};

//send image message
export const sendImageMessage = async (imageFile, currentUser, selectedPerson) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("from", JSON.stringify({currentUser}));
  formData.append("to", JSON.stringify({selectedPerson}));
  
  return fetchAPI('/imagesent', {
    method: "post",
    body: formData,
    //don't set Content-Type when sending FormData
    headers: {
      "Content-Type": undefined
    }
  });
};