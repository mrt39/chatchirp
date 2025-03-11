//user routes
const router = require("express").Router();
const { isAuthenticated } = require('../utilities/authUtilities');
const { getAllUsers, getUserById, updateUserProfile } = require('../utilities/userUtilities');

//get all users
router.get("/getallusers", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (err) {
    res.send(err);
  }
});

//get user profile
router.get("/profile/:userid", async (req, res) => {
  const userID = req.params.userid;
  try {
    const user = await getUserById(userID);
    console.log("changed value of the user: " + user);
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

//edit user profile
router.patch("/editprofile/:userid", isAuthenticated, async (req, res) => {
  const userid = req.params.userid;
  try {
    const result = await updateUserProfile(userid, {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio
    });
    
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;