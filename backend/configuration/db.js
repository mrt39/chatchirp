//database connection configuration
const mongoose = require("mongoose");
require('dotenv').config();

//define the database URL to connect to.
const dev_db_url = "mongodb://127.0.0.1:27017/chatChirpUserDB";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

//connect to the database with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    //try to reconnect after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

//export the connection function
module.exports = { connectDB };