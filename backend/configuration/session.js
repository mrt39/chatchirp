//session configuration
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

const dev_db_url = "mongodb://127.0.0.1:27017/chatChirpUserDB";

//create mongodb store for sessions
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI || dev_db_url,
  collection: 'mySessions'
});

//session configuration
const sessionConfig = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    proxy: true, //needed for production
    store: store, //store to mongodb
    cookie: {
      secure: process.env.NODE_ENV === 'production', //true for production if hosted on HTTPS, false for development
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict' //'none' for production, 'strict' for development
    }
});

module.exports = sessionConfig;