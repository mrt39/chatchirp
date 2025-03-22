/**
 * FRONTEND PUSHER IMPLEMENTATION OVERVIEW
 * 
 * 
 * HOW PUSHER ARCHITECTURE WORKS (CLIENT SIDE):
 * 
 * 1. CONNECTION ESTABLISHMENT FLOW:
 *    - When a user logs in, App.jsx calls connectPusher() to establish the WebSocket connection
 *    - Then it subscribes to private channels with the user's ID
 *    - Pusher handles connection management, including auto-reconnect if connection drops
 * 
 * 2. MESSAGE RECEIVING FLOW:
 *    - Components register event handlers via onPusherEvent()
 *    - When a message event is received from the server:
 *      a. The message is processed by the registered handler
 *      b. If currently viewing the relevant conversation, the message is added to UI immediately
 *      c. The contacts list is updated to show the latest message
 *    - All of this happens without making any HTTP requests
 * 
 * 
 * The Pusher client automatically handles reconnection and WebSocket communication
 */

import Pusher from 'pusher-js';

//pusher instance
let pusher = null;
//user's private channel
let privateChannel = null;
//current authenticated user id
let currentUserId = null;

//connect to the pusher server
//this function initializes the pusher connection with proper configuration
//it's called when the application starts and the user is authenticated
function connectPusher() {
  if (!pusher) {
    const appKey = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
    
    pusher = new Pusher(appKey, {
        cluster: cluster,
        forceTLS: true,
        authorizer: (channel) => {
          //custom authorizer that directly sends the user_id with the auth request
          return {
            authorize: (socketId, callback) => {
              fetch(`${import.meta.env.VITE_BACKEND_URL}/pusher/auth`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'X-User-Id': currentUserId || ''
                },
                body: new URLSearchParams({
                  socket_id: socketId,
                  channel_name: channel.name,
                  user_id: currentUserId || ''
                })
              })
              .then(response => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error(`Auth failed with status ${response.status}`);
                }
              })
              .then(data => {
                callback(null, data);
              })
              .catch(error => {
                callback(error, { auth: '' });
              });
            }
          };
        }
      });
    
    //pusher connection success confirmation
    pusher.connection.bind('connected', () => {
      console.log('Pusher connected successfully');
    });
    
    //pusher connection fail error
    pusher.connection.bind('error', (err) => {
      console.log('Pusher connection failed', err);
    });
  }
  
  return pusher; //return the pusher instance for direct access
}

//authenticate user with channel subscription
//this tells the server which user this connection belongs to
//enabling targeted message delivery to this specific user
function authenticateUser(userId) {
  if (pusher && userId) {
    //store the user ID for later use
    currentUserId = userId;
    
    //subscribe to user's private channel
    const channelName = `private-user-${userId}`;
    privateChannel = pusher.subscribe(channelName);
    
    //handle subscription succeeded
    privateChannel.bind('pusher:subscription_succeeded', () => {
      
      //notify server this user is online
      fetch(`${import.meta.env.VITE_BACKEND_URL}/pusher/user/online?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId //add user ID as a header as well
        }
      });
    });
    
    //handle subscription error
    privateChannel.bind('pusher:subscription_error', (err) => {
      console.error(`Error subscribing to ${channelName}:`, err);
    });
  }
}

//disconnect and clean up pusher
//this is called when the user logs out
function disconnectPusher() {
  if (privateChannel) {
    privateChannel.unbind_all();
    pusher.unsubscribe(privateChannel.name);
    privateChannel = null;
  }
  
  if (pusher) {
    pusher.disconnect();
    pusher = null;
  }
  
  currentUserId = null;
}

//get the current pusher instance
function getPusher() {
  return pusher;
}

//get the user's private channel
function getPrivateChannel() {
  return privateChannel;
}

//add an event listener to the private channel
//this is the main way components will listen for incoming messages
function onPusherEvent(event, callback) {
  if (privateChannel) {
    privateChannel.bind(event, callback);
    return true; //successful registration
  }
  return false; //channel not initialized
}

//remove an event listener from the private channel
function offPusherEvent(event, callback) {
  if (privateChannel) {
    privateChannel.unbind(event, callback);
    return true;
  }
  return false;
}

export {
  connectPusher,
  authenticateUser,
  disconnectPusher,
  getPusher,
  getPrivateChannel,
  onPusherEvent,
  offPusherEvent
};