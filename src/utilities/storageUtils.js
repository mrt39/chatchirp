//utilities for managing browser storage and cached data

import { saveCacheData, retrieveFromCache, clearCache } from './cacheManager';

//cache contacts data
//this function stores contact data in sessionStorage to persist between route changes
export function cacheContacts(userId, contacts) {
  if (!userId || !contacts) return; //guard against invalid inputs
  
  //use the generic caching system with contacts-specific key
  saveCacheData('contactsCache', contacts, userId);
}

//get cached contacts data if not expired (in 5 minutes)
//this function retrieves and validates cached contact data
//implements a Time-To-Live (TTL) mechanism to ensure data doesn't get old
export function getCachedContacts(userId, ttlMinutes = 5) {
  try {
    return retrieveFromCache('contactsCache', userId, ttlMinutes);
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
    clearCache('contactsCache');
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
  
  //use the generic caching system
  saveCacheData('profileCache', profileData, userId);
}

//get cached user profile if not expired
//this function implements the cache-first data strategy to minimize API requests
export function getCachedUserProfile(userId, ttlMinutes = 5) {
  try {
    return retrieveFromCache('profileCache', userId, ttlMinutes);
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
    clearCache('profileCache');
  } catch (error) {
    //handle potential storage access issues without breaking functionality
    console.error('Error clearing user profile cache:', error);
  }
}


//cache all users data with TTL
//this prevents unnecessary API calls when navigating to/from the findpeople route
export function cacheAllUsers(users) {
  if (!users) return; //prevent storing invalid or empty data
  
  //use the generic caching system
  saveCacheData('allUsersCache', users);
}

//get cached users data if not expired
//includes TTL mechanism to ensure data freshness
export function getCachedAllUsers(ttlMinutes = 5) {
  try {
    return retrieveFromCache('allUsersCache', null, ttlMinutes);
  } catch (error) {
    console.error('Error retrieving cached all users:', error);
    return null;
  }
}

//clear all users cache
export function clearAllUsersCache() {
  try {
    clearCache('allUsersCache');
  } catch (error) {
    console.error('Error clearing all users cache:', error);
  }
}