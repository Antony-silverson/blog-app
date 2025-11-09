// ===============================================
// 👤 User Routes - Profile, Update, My Blogs
// ===============================================
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Blog = require("../models/Blog");

// ✅ Middleware to check login
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// 👤 View Profile
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const blogs = await Blog.find({ user: user._id }).sort({ date: -1 });

    res.render("profile", { user, blogs });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Error loading profile.");
  }
});

// ✏️ Edit Profile Page
router.get("/edit-profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render("edit-profile", { user });
  } catch (err) {
    console.error("Error loading edit profile:", err);
    res.status(500).send("Error loading edit profile.");
  }
});

// 🔁 Update Profile
router.post("/update-profile", isLoggedIn, async (req, res) => {
  try {
    const { username, email, bio } = req.body;

    await User.findByIdAndUpdate(req.session.user._id, {
      username,
      email,
      bio,
    });

    // Refresh session with updated data
    const updatedUser = await User.findById(req.session.user._id);
    req.session.user = updatedUser;

    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Error updating profile.");
  }
});

module.exports = router;
