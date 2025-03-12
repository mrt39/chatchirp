//utilities for managing browser storage and cached data

//cache contacts data
//this function stores contact data in sessionStorage to persist between route changes
export function cacheContacts(userId, contacts) {
  if (!userId || !contacts) return; //guard against invalid inputs
  
  //create a cache object containing the data and metadata for TTL and validation
  //timestamp allows expiry checking, userId ensures the app doesn't use another user's cached data
  const cacheData = {
    contacts, //the actual contacts data to cache
    timestamp: Date.now(), //current time for TTL calculation
    userId //store which user this data belongs to
  };
  
  try {
    //store in sessionStorage which persists until tab is closed
    sessionStorage.setItem('contactsCache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching contacts:', error);
  }
}

//get cached contacts data if not expired (in 5 minutes)
//this function retrieves and validates cached contact data
//implements a Time-To-Live (TTL) mechanism to ensure data doesn't get old
export function getCachedContacts(userId, ttlMinutes = 5) {
  try {
    const cachedData = sessionStorage.getItem('contactsCache');
    if (!cachedData) return null; //no cache available
    
    const parsedData = JSON.parse(cachedData);
    
    //check if cache is for current user
    //prevents one user from seeing another user's contacts
    if (parsedData.userId !== userId) return null;
    
    //check if cache is expired based on configurable TTL
    //this ensures data doesn't become old if the session lasts a long time
    const now = Date.now();
    const cacheDuration = now - parsedData.timestamp;
    const cacheExpired = cacheDuration > ttlMinutes * 60 * 1000;
    
    //return null if expired, otherwise return the cached contacts
    //this forced refresh after TTL ensures data doesn't get out-of-sync
    return cacheExpired ? null : parsedData.contacts;
  } catch (error) {
    console.error('Error retrieving cached contacts:', error);
    return null;
  }
}

//clear contacts cache
//utility function to manually invalidate cache when needed
//useful when data is known to have changed and needs to be refreshed
export function clearContactsCache() {
  try {
    sessionStorage.removeItem('contactsCache');
  } catch (error) {
    console.error('Error clearing contacts cache:', error);
  }
}

//save state that should persist across route navigation
//extends the caching concept beyond just contacts
export function saveNavigationState(key, value) {
  try {
    //prefix with 'nav_' to distinguish from other sessionStorage items
    //this namespace approach prevents collisions with other stored values
    sessionStorage.setItem(`nav_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving navigation state for ${key}:`, error);
  }
}

//get state that should persist across route navigation
//companion function to saveNavigationState for retrieving cached navigation state
//includes a defaultValue parameter for when the state isn't found in cache
export function getNavigationState(key, defaultValue = null) {
  try {
    const value = sessionStorage.getItem(`nav_${key}`);
    //return parsed value or default if not found
    //the defaultValue parameter makes this function more flexible for various use cases
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving navigation state for ${key}:`, error);
    return defaultValue;
  }
}

//cache user profile data with TTL
export function cacheUserProfile(userId, profileData) {
  if (!userId || !profileData) return; //prevent storing invalid data
  
  //create a structured cache object that includes:
  //- the profile data itself for retrieval
  //- a timestamp to enable TTL (time-to-live) functionality
  //- userId to ensure proper data isolation between different users
  const cacheData = {
    profile: profileData, //store the actual profile information
    timestamp: Date.now(), //record when the cache was created for TTL checks
    userId //include user id to prevent cross-user data leakage
  };
  
  try {
    //store the cache object in browser's sessionStorage
    sessionStorage.setItem('profileCache', JSON.stringify(cacheData));
  } catch (error) {
    //handle storage quota exceeded or private browsing limitations
    //logging instead of throwing allows app to continue functioning when caching fails
    console.error('Error caching user profile:', error);
  }
}

//get cached user profile if not expired
//this function implements the cache-first data strategy to minimize API requests
export function getCachedUserProfile(userId, ttlMinutes = 5) {
  try {
    //attempt to retrieve the cached profile data
    const cachedData = sessionStorage.getItem('profileCache');
    if (!cachedData) return null; //early return when cache is empty
    
    //parse the JSON data back into an object
    //this restores the structure created in cacheUserProfile function
    const parsedData = JSON.parse(cachedData);
    
    //security check: verify that the cached data belongs to current user
    if (parsedData.userId !== userId) return null;
    
    //freshness check: implement TTL (time-to-live) mechanism
    const now = Date.now();
    const cacheDuration = now - parsedData.timestamp; //calculate how old the cache is
    //compare against configured TTL (5 minutes default)
    const cacheExpired = cacheDuration > ttlMinutes * 60 * 1000;
    
    //return either the cache hit or null if expired
    return cacheExpired ? null : parsedData.profile;
  } catch (error) {
    //handle parsing errors or storage access issues
    console.error('Error retrieving cached user profile:', error);
    return null;
  }
}

//clear user profile cache
//utility function to manually invalidate cache when needed
//useful when profile data changes and needs to be refreshed
export function clearUserProfileCache() {
  try {
    //completely remove the profile cache entry from sessionStorage
    //this forces the next data request to hit the API instead of using cached data
    sessionStorage.removeItem('profileCache');
  } catch (error) {
    //handle potential storage access issues without breaking functionality
    console.error('Error clearing user profile cache:', error);
  }
}


//cache all users data with TTL
//this prevents unnecessary API calls when navigating to/from the findpeople route
export function cacheAllUsers(users) {
  if (!users) return; //prevent storing invalid or empty data
  
  //create a structured cache object that includes:
  //- the users data itself for retrieval
  //- a timestamp to enable TTL (time-to-live) functionality
  const cacheData = {
    users, //the users data to cache
    timestamp: Date.now() //record when the cache was created for TTL checks
  };
  
  try {
    //store the cache object in browser's sessionStorage
    //sessionStorage will persist during browser session but clears when tab closes
    sessionStorage.setItem('allUsersCache', JSON.stringify(cacheData));
  } catch (error) {
    //handle edge cases like storage quota exceeded or private browsing limitations
    console.error('Error caching all users:', error);
  }
}

//get cached users data if not expired
//includes TTL mechanism to ensure data freshness
export function getCachedAllUsers(ttlMinutes = 5) {
  try {
    //attempt to retrieve the cached users data
    const cachedData = sessionStorage.getItem('allUsersCache');
    if (!cachedData) return null; //early return when cache is empty
    
    //parse the JSON data back into an object
    const parsedData = JSON.parse(cachedData);
    
    //freshness check: implement TTL (time-to-live) mechanism
    //this ensures data doesn't become old or outdated by enforcing a maximum age
    const now = Date.now();
    const cacheDuration = now - parsedData.timestamp; //calculate how old the cache is
    //compare against configured TTL (5 minutes default)
    const cacheExpired = cacheDuration > ttlMinutes * 60 * 1000;
    
    //return either the cache or null if expired
    return cacheExpired ? null : parsedData.users;
  } catch (error) {
    //handle any parsing errors or storage access issues
    console.error('Error retrieving cached users:', error);
    return null;
  }
}

//clear all users cache
export function clearAllUsersCache() {
  try {
    //completely remove the users cache entry from sessionStorage
    sessionStorage.removeItem('allUsersCache');
  } catch (error) {
    //handle potential storage access issues
    console.error('Error clearing users cache:', error);
  }
}