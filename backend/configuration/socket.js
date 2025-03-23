/*
 * Socket functionality has been removed from this application and is no longer in use.
 * WebSocket-based implementations, such as those using Socket.IO, are not supported on Vercel deployments
 * due to Vercel's serverless architecture, which does not accommodate long-running connections like WebSockets.
 * https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections
 *
 * This application has transitioned to using Pusher for real-time messaging and functionality.
 * The socket configuration files remain in the codebase for backward compatibility and reference purposes,
 * but they are no longer active or maintained. All real-time features are now handled via Pusher.
 */

/**
 * SOCKET.IO SERVER IMPLEMENTATION
 * 
 * Socket.io provides real-time, bidirectional communication between clients and servers.
 * This implementation establishes a WebSocket connection that enables instant message delivery.
 * 
 * HOW THE SOCKET ARCHITECTURE WORKS:
 * 
 * 1. CONNECTION FLOW:
 *    - When a user loads the app, their browser initiates a Socket.io connection
 *    - The connection is authenticated by associating the socket ID with a user ID
 *    - This mapping is stored in userSocketMap for future message routing
 * 
 * 2. MESSAGE DELIVERY FLOW:
 *    - User A sends a message through regular HTTP POST to the server
 *    - Server stores message to MongoDB database
 *    - Server looks up User B's socket ID using userSocketMap
 *    - Server emits a 'new_message' event directly to User B's socket
 *    - User B's browser receives this event instantly through the WebSocket connection
 *    - No additional HTTP requests are made for the real-time part of message delivery
 * 
 * 3. KEY COMPONENTS:
 *    - Server: Socket.io server attached to Express HTTP server
 *    - UserSocketMap: Associates user IDs with their current socket connections
 *    - Event Handlers: Manages socket lifecycle (connect, authenticate, disconnect)
 *    - Utility Functions: Provides a clean API for emitting events to specific users
 */

//import the socket.io Server class
const { Server } = require('socket.io');
//import the cors config
const { ALLOWED_ORIGIN, corsOptions } = require('./cors-config');


//initialize the socket.io server and set up connection management
//this function is called from index.js after the HTTP server is created
//it returns utility functions that will be used throughout the application
function initializeSocket(server) {
  //create a new Socket.io server instance attached to our HTTP server
  //these settings need to match our frontend origin to allow connections
  const io = new Server(server, {
    cors: corsOptions
  });
  
  //create a Map to associate user IDs with their socket IDs
  //so that it knows which socket to send messages to for a given user
  const userSocketMap = new Map();
  
  //debugging function to log current user-to-socket mappings
  function logSocketMap() {
    console.log("Current socket map:");
    for (const [userId, socketId] of userSocketMap.entries()) {
      console.log(`User ${userId} => Socket ${socketId}`);
    }
  }
  
  //set up event handlers for socket connections
  //the connection event fires whenever a client connects to the socket server
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    console.log(`Active connections: ${io.engine.clientsCount}`);
    
    //handle user authentication for this socket
    //the frontend emits this event after successful user login
    //it associates the socket with a specific user ID for targeted message delivery
    socket.on('authenticate', (userId) => {
      //verify we have a valid userId before mapping
      if (!userId) {
        console.log("Authentication failed: No user ID provided");
        return;
      }
      
      //ensure consistent string format for user IDs
      //MongoDB ObjectIDs can be objects or strings in different contexts, converting to string ensures consistent mapping and lookup
      const userIdStr = String(userId);
      
      //store the user ID to socket ID mapping
      userSocketMap.set(userIdStr, socket.id);
      
      console.log(`Socket authenticated for user: ${userIdStr} (socket ${socket.id})`);
      console.log(`Total authenticated users: ${userSocketMap.size}`);
      logSocketMap(); //log all current socket mappings for debugging
      
      //confirm successful authentication back to the client
      //this helps the client know when it can start receiving messages
      socket.emit('authenticated', { 
        status: 'success',
        message: `Socket authenticated for user: ${userIdStr}`
      });
    });
    
    //handle socket disconnection
    //very important for cleaning up socket references when users close browser/tab
    //or when connection ends for any other reason
    socket.on('disconnect', () => {
      //find the user associated with this socket ID and remove the mapping
      let disconnectedUser = null;
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          disconnectedUser = userId;
          userSocketMap.delete(userId); //remove the mapping
          console.log(`Socket disconnected for user: ${userId}`);
          break;
        }
      }
      
      //log remaining connections for debugging
      if (disconnectedUser) {
        console.log(`User ${disconnectedUser} disconnected. Remaining connected users: ${userSocketMap.size}`);
        logSocketMap(); //show the updated socket map after disconnect
      }
    });
  });
  
  //return utility functions for the rest of the application to use
  return {
    io, //expose raw io object
    
    //look up a user's socket by their user ID
    //need this for checking if a user is currently online
    getUserSocket: (userId) => {
      //validate userId to prevent lookup errors
      if (!userId) {
        console.log("getUserSocket called with no userId");
        return null;
      }
      
      //ensure consistent string format for userId lookup
      const userIdStr = String(userId);
      const socketId = userSocketMap.get(userIdStr);
      
      console.log(`Looking up socket for user ${userIdStr}: ${socketId || 'not found'}`);
      
      //return the actual socket object if found, or null if not found
      return socketId ? io.sockets.sockets.get(socketId) : null;
    },
    
    //send an event to a specific user by their user ID
    //this is the primary function used for delivering messages to recipients
    //it's called by the message and image routes when sending messages
    emitToUser: (userId, event, data) => {
      //validate userId to prevent errors
      if (!userId) {
        console.log("emitToUser called with no userId");
        return false;
      }
      
      //ensure consistent string format for userId lookup
      const userIdStr = String(userId);
      const socketId = userSocketMap.get(userIdStr);
      
      //if socket found, emit the event to that socket
      if (socketId) {
        console.log(`Emitting ${event} to user ${userIdStr} (socket ${socketId})`);
        io.to(socketId).emit(event, data);
        return true; //successful delivery
      }
      
      //user not found or not connected
      console.log(`Failed to emit ${event} to user ${userIdStr}: no socket found in map`);
      logSocketMap(); //show current connections for debugging
      return false; //failed delivery
    }
  };
}

module.exports = { initializeSocket };