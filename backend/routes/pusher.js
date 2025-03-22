//pusher authentication routes
const router = require("express").Router();
const { pusherAuthHandler, markUserOnline } = require('../configuration/pusher-service');


//authentication endpoint for pusher private channels
//this is called by pusher-js when a client subscribes to a private channel
router.post('/auth', pusherAuthHandler);

//endpoint to mark a user as online
router.post('/user/online', markUserOnline);

module.exports = router;