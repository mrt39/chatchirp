//user related utility functions
const { User } = require('../models/models');

//get all users
const getAllUsers = async () => {
  return await User.find();
};

//get user by id
const getUserById = async (userId) => {
  return await User.find({_id: userId});
};

//update user profile
const updateUserProfile = async (userId, userData) => {
  const user = await User.findOne({_id: userId});
  if (!user) {
    throw new Error('User not found');
  }
  
  user.name = userData.name;
  user.email = userData.email;
  user.bio = userData.bio;
  
  return await user.save();
};

//update user profile picture
const updateProfilePicture = async (userId, imageUrl) => {
  const user = await User.findOne({_id: userId});
  if (!user) {
    throw new Error('User not found');
  }
  
  user.uploadedpic = imageUrl;
  return await user.save();
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateProfilePicture
};