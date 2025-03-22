/**
 * PUSHER SERVER IMPLEMENTATION
 * 
 * Pusher provides real-time communication between clients and servers.
 * This implementation establishes a WebSocket connection that enables instant message delivery.
 * 
 * HOW THE PUSHER ARCHITECTURE WORKS:
 * 
 * 1. CONNECTION FLOW:
 *    - When a user loads the app, their browser initiates a Pusher connection
 *    - The connection is authenticated by subscribing to private channels
 *    - The server authorizes these subscriptions through an auth endpoint
 * 
 * 2. MESSAGE DELIVERY FLOW:
 *    - User A sends a message through regular HTTP POST to the server
 *    - Server stores message to MongoDB database
 *    - Server triggers an event on User B's private channel
 *    - User B's browser receives this event instantly through the WebSocket connection
 *    - No additional HTTP requests are made for the real-time part of message delivery
 * 
 * 3. KEY COMPONENTS:
 *    - Server: Pusher instance for triggering events
 *    - Channels: Private channels for each user for secure message delivery
 *    - Auth Endpoint: Secures channels so only intended recipients can subscribe
 *    - Utility Functions: Provides a clean API for emitting events to specific users
 */

require('dotenv').config();
const Pusher = require('pusher');
const { ALLOWED_ORIGIN } = require('./cors-config');

//create a pusher instance with environment variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

//maintain a map of online users (equivalent to socket.io implementation)
const userOnlineMap = new Map();

//initialize pusher service and set up utility functions
//this function is called in index.js similar to initializeSocket
function initializePusherService() {
  //debugging function to log current online users
  function logOnlineUsers() {
    console.log("Current online users:");
    for (const userId of userOnlineMap.keys()) {
      console.log(`User ${userId} is online`);
    }
  }
  
  //return utility functions for the rest of the application to use
  //these match the socket.io function signatures for compatibility
  return {
    //expose the pusher instance
    pusher: pusher,
    
    //check if a user is currently online
    isUserOnline: (userId) => {
      if (!userId) {
        console.log("isUserOnline called with no userId");
        return false;
      }
      
      //ensure consistent string format for userId lookup
      const userIdStr = String(userId);
      return userOnlineMap.has(userIdStr);
    },
    
    //mark a user as online (call this when they authenticate)
    setUserOnline: (userId) => {
      if (!userId) {
        console.log("setUserOnline called with no userId");
        return false;
      }
      
      //ensure consistent string format
      const userIdStr = String(userId);
      userOnlineMap.set(userIdStr, true);
      
      console.log(`User ${userIdStr} is now online`);
      logOnlineUsers();
      return true;
    },
    
    //mark a user as offline (called when they disconnect)
    setUserOffline: (userId) => {
      if (!userId) {
        console.log("setUserOffline called with no userId");
        return false;
      }
      
      //ensure consistent string format
      const userIdStr = String(userId);
      userOnlineMap.delete(userIdStr);
      
      console.log(`User ${userIdStr} is now offline`);
      logOnlineUsers();
      return true;
    },
        
    //send an event to a specific user by their user ID
    //this is the primary function used for delivering messages to recipients
    //direct replacement for socket.io's emitToUser
    emitToUser: (userId, event, data) => {
      if (!userId) {
        console.log("emitToUser called with no userId");
        return false;
      }
      
      //ensure consistent string format for userId
      const userIdStr = String(userId);
      
      //check if user is online (optional - Pusher will deliver when they connect)
      const isOnline = userOnlineMap.has(userIdStr);
      console.log(`Triggering ${event} to user ${userIdStr} (${isOnline ? 'online' : 'offline'})`);
      
      //trigger event on user's private channel
      return pusher.trigger(`private-user-${userIdStr}`, event, data)
        .then(() => {
          console.log(`Successfully triggered ${event} to user ${userIdStr}`);
          return true;
        })
        .catch(err => {
          console.error(`Failed to trigger ${event} to user ${userIdStr}:`, err);
          return false;
        });
    }
  };
}

//create an authentication middleware for Pusher channels
//this will be mounted as a route in index.js
function pusherAuthHandler(req, res) {
  //log the request for debugging
  console.log('Pusher auth request received');
  console.log('Auth headers:', req.headers);
  console.log('Auth body:', req.body);
  
  //first check if the request contains required parameters
  if (!req.body.socket_id || !req.body.channel_name) {
    console.log('Pusher auth failed: Missing socket_id or channel_name in request body');
    return res.status(400).send('Bad request: Missing required parameters');
  }
  
  const socket_id = req.body.socket_id;
  const channel_name = req.body.channel_name;
  
  //extract user ID from multiple possible sources
  //custom headers are preferable, falling back to body, query, then auth
  let userId = req.headers['x-user-id'] || req.body.user_id || req.query.user_id;
  
  //extract channel user ID from channel name for verification
  const channelParts = channel_name.split('-');
  if (channelParts.length < 3 || channelParts[0] !== 'private' || channelParts[1] !== 'user') {
    console.log(`Pusher auth failed: Invalid channel format: ${channel_name}`);
    return res.status(403).send('Not authorized: Invalid channel format');
  }
  
  //handle IDs with hyphens
  const channelUserId = channelParts.slice(2).join('-'); 
   
  //verify the user is requesting their own channel
  if (!userId || userId !== channelUserId) {
    console.log(`Pusher auth failed: User ID mismatch or missing. Channel: ${channel_name}, User: ${userId || 'undefined'}`);
    return res.status(403).send('Not authorized: User ID mismatch');
  }
  
  //authenticate the channel subscription
  const auth = pusher.authorizeChannel(socket_id, channel_name);
  
  console.log(`Authorized channel ${channel_name} for user ${userId}`);
  
  //mark user as online when they authenticate
  if (global.pusherService) {
    global.pusherService.setUserOnline(userId);
  }
  
  res.send(auth);
}

//mark user as online endpoint handler
function markUserOnline(req, res) {
  //check token-based auth (passed via query param, body or header)
  const userId = req.query.user_id || req.body.user_id || req.headers['x-user-id'];
  
  if (!userId) {
    console.log('Mark online failed: Missing user_id parameter');
    return res.status(400).send('Bad request: Missing user_id parameter');
  }
  
  if (global.pusherService) {
    global.pusherService.setUserOnline(userId);
    return res.status(200).send({ status: 'success', message: 'User marked as online' });
  }
  
  res.status(500).send({ status: 'error', message: 'Pusher service not initialized' });
}

module.exports = { 
  initializePusherService, 
  pusherAuthHandler,
  markUserOnline
};