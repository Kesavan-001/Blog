const User = require('../models/User');

// Get user profile
const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (only username and email in this example)
const updateUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
  try {
    const { username, email } = req.body;
    req.user.username = username || req.user.username;
    req.user.email = email || req.user.email;
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserProfile, updateUserProfile };
