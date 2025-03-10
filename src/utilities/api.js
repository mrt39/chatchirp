// functions for making API calls to the backend

//base fetch function for all api calls
export async function fetchAPI(endpoint, options = {}) {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_URL;
    const url = `${baseURL}${endpoint}`;
    
    //default options
    const fetchOptions = {...options};
    
    //only set default headers if not sending FormData
    if (!(options.body instanceof FormData)) {
      fetchOptions.headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        ...(options.headers || {})
      };
    } else {
      //for FormData, don't set Content-Type - browser will set it with boundary
      fetchOptions.headers = {
        "Access-Control-Allow-Origin": "*",
        ...(options.headers || {})
      };
    }
    
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
}

// get current logged in user data
export async function fetchCurrentUser() {
  return fetchAPI('/login/success', {
    method: 'GET',
    credentials: 'include',
    headers: {
      "Access-Control-Allow-Credentials": true,
    },
  });
}

// get user profile data from database
export async function fetchUserProfile(userId) {
  return fetchAPI(`/profile/${userId}`, {
    method: 'GET',
  });
}

// logout user
export async function logoutUser() {
  return fetchAPI('/logout', {
    method: 'POST',
    credentials: 'include'
  });
}

// get contacts for message box
export async function fetchContacts(userId) {
  return fetchAPI(`/messagebox/${userId}`, {
    method: 'GET',
  });
}

// get messages between two users
export async function fetchMessages(userId, selectedPersonId) {
  return fetchAPI(`/messagesfrom/${userId}_${selectedPersonId}`, {
    method: 'GET',
  });
}

// send a message
export async function sendMessage(from, to, message) {
  return fetchAPI('/messagesent', {
    method: "post",
    body: JSON.stringify({ from, to, message }), 
    credentials: "include"
  });
}

// update user profile
export async function updateProfile(userId, userData) {
  return fetchAPI(`/editprofile/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

// upload profile picture
export async function uploadProfilePicture(userId, formData) {
  return fetchAPI(`/uploadprofilepic/${userId}`, {
    method: "post",
    body: formData, 
    //don't set Content-Type header when sending FormData, browser will set it with boundary
    headers: {}    
  });
}

//send image message
export async function sendImageMessage(imageFile, currentUser, selectedPerson) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("from", JSON.stringify({currentUser}));
  formData.append("to", JSON.stringify({selectedPerson}));
  
  return fetchAPI('/imagesent', {
    method: "post",
    body: formData,
    //don't set content-type hedaer when sending FormData
    headers: {}
  });
}