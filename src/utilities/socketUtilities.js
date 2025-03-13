/**
 * FRONTEND SOCKET.IO IMPLEMENTATION OVERVIEW
 * 
 * 
 * HOW THE SOCKET ARCHITECTURE WORKS (CLIENT SIDE):
 * 
 * 1. CONNECTION ESTABLISHMENT FLOW:
 *    - When a user logs in, App.jsx calls connectSocket() to establish the WebSocket connection
 *    - Then it calls authenticateSocket() with the user's ID to link socket to user account
 *    - Socket.io handles connection management, including auto-reconnect if connection drops
 * 
 * 2. MESSAGE RECEIVING FLOW:
 *    - MessageContext.jsx registers event handlers via onSocketEvent()
 *    - When a 'new_message' event is received from the server:
 *      a. The message is checked to confirm it's for the current user
 *      b. If currently viewing the relevant conversation, the message is added to UI immediately
 *      c. The contacts list is updated to show the latest message
 *    - All of this happens without making any HTTP requests
 * 
 * 
 * The Socket.io client automatically handles reconnection, upgrading from HTTP polling to 
 * WebSockets, and other complex connection management tasks transparently.
 */

import { io } from "socket.io-client";

//socket instance
let socket = null;

//connect to the socket.io server
//this function initializes the socket connection with proper configuration
//it's called when the application starts and the user is authenticated
export function connectSocket() {
  if (!socket) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    socket = io(backendUrl, {
      withCredentials: true, //enable cookies for authentication
      autoConnect: true,     //connect immediately
      reconnection: true,    //enable automatic reconnection
      reconnectionAttempts: 5, //try reconnecting 5 times
      reconnectionDelay: 1000  //wait 1 second between attempts
    });
    
    //socket connection success confirmation
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    //socket connection fail error
    socket.on('error', () => {
        console.log('Socket connection failed');
    });
  }
  
  return socket; //return the socket instance for direct access
}

//authenticate socket with user ID
//this tells the server which user this socket belongs to
//enabling targeted message delivery to this specific user
export function authenticateSocket(userId) {
  if (socket && userId) {
    //emit authentication event with userId to backend
    //this connects the socket to a specific user account
    socket.emit('authenticate', userId);
  }
}

//disconnect and clean up socket
//this is called when the user logs out to prevent memory leaks and unauthorized socket connections
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null; 
  }
}

//get the current socket instance
//this will be used to add custom event handlers or emit events directly
export function getSocket() {
  return socket;
}

//add an event listener to the socket
//this is the main way components will listen for incoming messages
//callback function will be invoked whenever the specified event occurs
export function onSocketEvent(event, callback) {
  if (socket) {
    socket.on(event, callback);
    return true; //successful registration
  }
  return false; //socket not initialized
}

//remove an event listener from the socket
//this cleans up listeners
export function offSocketEvent(event, callback) {
  if (socket) {
    socket.off(event, callback);
    return true; 
  }
  return false;
}