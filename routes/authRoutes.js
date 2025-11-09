// ===============================================
// 🔐 Auth Routes (Signup, Login, Logout, Reset Password)
// ===============================================
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ==================================================
// 📝 SIGNUP
// ==================================================
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.send("<h3>Username or Email already exists. Try another one.</h3>");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Start session
    req.session.user = newUser;
    res.redirect("/profile");
  } catch (err) {
    console.error("Signup Error:", err);
    res.send("Signup failed. Please try again.");
  }
});

// ==================================================
// 🔑 LOGIN
// ==================================================
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.send("<h3>User not found. Try again.</h3>");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("<h3>Invalid password.</h3>");

    req.session.user = user;
    res.redirect("/profile");
  } catch (err) {
    console.error("Login Error:", err);
    res.send("Login failed. Please try again.");
  }
});

// ==================================================
// 🚪 LOGOUT
// ==================================================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ==================================================
// 🔁 FORGOT PASSWORD
// ==================================================
router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.send("<h3>Email not found. Try again.</h3>");
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    // ✅ FIX: Gmail transporter with TLS setting
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "antonysilverson34@gmail.com", // replace with your Gmail
        pass: "blogapp@1234",   // use App Password (not your Gmail login password)
      },
      tls: {
        rejectUnauthorized: false, // prevents "self-signed certificate" error
      },
    });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      from: "youremail@gmail.com",
      subject: "Reset Your Password - Blog App",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetLink}" style="color:#4CAF50;">${resetLink}</a>
      `,
    });

    res.send("<h3>✅ Reset link sent! Please check your email inbox.</h3>");
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.send("Something went wrong. Please try again later.");
  }
});

// ==================================================
// 🔒 RESET PASSWORD
// ==================================================
router.get("/reset-password/:token", async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    return res.send("<h3>Invalid or expired token.</h3>");
  }
  res.render("resetPassword", { token: req.params.token });
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) return res.send("<h3>Invalid or expired token.</h3>");

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.send("<h3>Password updated! You can now <a href='/login'>login</a>.</h3>");
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.send("Error resetting password. Try again.");
  }
});

module.exports = router;
