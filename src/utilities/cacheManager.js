//centralized cache management system
//provides consistent caching behavior across different data types

//save data to cache with metadata
function saveCacheData(cacheKey, data, userId = null, ttlMinutes = 5) {
    if (!cacheKey || data === undefined) {
      return false; //guard against invalid inputs
    }
    
    //create a structured cache object that includes:
    //- the data itself for retrieval
    //- a timestamp to enable TTL (time-to-live) functionality
    //- userId to ensure proper data isolation between different users
    const cacheData = {
      data, //store the actual data to cache
      timestamp: Date.now(), //record when the cache was created for TTL checks
      userId //include user id to prevent cross-user data leakage
    };
    
    try {
      //store in sessionStorage which persists until tab is closed
      //sessionStorage will persist during browser session but clears when tab closes
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      //handle storage quota exceeded or private browsing limitations
      //logging instead of throwing allows app to continue functioning when caching fails
      console.error(`Error caching data for ${cacheKey}:`, error);
      return false;
    }
  }
  
  //retrieve data from cache with validation
  //this function implements the cache-first data strategy to minimize API requests
  function retrieveFromCache(cacheKey, userId = null, ttlMinutes = 5) {
    try {
      //attempt to retrieve the cached data
      const cachedData = sessionStorage.getItem(cacheKey);
      if (!cachedData) {
        return null; //no cache available, early return when cache is empty
      }
      
      //parse the JSON data back into an object
      //this restores the structure created in saveCacheData function
      const parsedData = JSON.parse(cachedData);
      
      //security check: verify that the cached data belongs to current user
      //prevents one user from seeing another user's data
      if (userId && parsedData.userId !== userId) {
        return null; //cache belongs to different user
      }
      
      //freshness check: implement TTL (time-to-live) mechanism
      //this ensures data doesn't become old if the session lasts a long time
      const now = Date.now();
      const cacheDuration = now - parsedData.timestamp; //calculate how old the cache is
      //compare against configured TTL (5 minutes default)
      const cacheExpired = cacheDuration > ttlMinutes * 60 * 1000;
      
      //return null if expired, otherwise return the cached data
      //this forced refresh after TTL ensures data doesn't get out-of-sync
      return cacheExpired ? null : parsedData.data;
    } catch (error) {
      //handle parsing errors or storage access issues
      console.error(`Error retrieving cached data for ${cacheKey}:`, error);
      return null;
    }
  }
  
  //clear specific cache entry
  //utility function to manually invalidate cache when needed
  //useful when data is known to have changed and needs to be refreshed
  function clearCache(cacheKey, userId = null) {
    try {
      if (userId) {
        //if userId provided, only clear if cache belongs to this user
        //this ensures security by preventing users from clearing each other's cache
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.userId === userId) {
            //completely remove the cache entry from sessionStorage
            //this forces the next data request to hit the API instead of using cached data
            sessionStorage.removeItem(cacheKey);
          }
        }
      } else {
        //remove cache regardless of owner
        //use for non-user-specific data or administrative functions
        sessionStorage.removeItem(cacheKey);
      }
      return true;
    } catch (error) {
      //handle potential storage access issues without breaking functionality
      console.error(`Error clearing cache for ${cacheKey}:`, error);
      return false;
    }
  }
  
  //check if cache exists and is valid
  //used to determine if cached data should be used or if an API call is needed
  function isValidCache(cacheKey, userId = null, ttlMinutes = 5) {
    try {
      //attempt to retrieve the cached data
      const cachedData = sessionStorage.getItem(cacheKey);
      if (!cachedData) {
        return false; //no cache available, early return when cache is empty
      }
      
      //parse the JSON data back into an object
      const parsedData = JSON.parse(cachedData);
      
      //verify that the cached data belongs to current user
      //prevents one user from seeing another user's data
      if (userId && parsedData.userId !== userId) {
        return false; //cache belongs to different user
      }
      
      //freshness check: implement TTL (time-to-live) mechanism
      //this ensures data doesn't become old or outdated by enforcing a maximum age
      const now = Date.now();
      const cacheDuration = now - parsedData.timestamp; //calculate how old the cache is
      //compare against configured TTL (5 minutes default)
      const cacheExpired = cacheDuration > ttlMinutes * 60 * 1000;
      
      return !cacheExpired;
    } catch (error) {
      //handle parsing errors or storage access issues
      console.error(`Error checking cache validity for ${cacheKey}:`, error);
      return false;
    }
  }
  
  export {
    saveCacheData,
    retrieveFromCache,
    clearCache,
    isValidCache
  };