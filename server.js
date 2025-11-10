// =========================================
//       MAIN SERVER FILE - server.js
// =========================================
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
require("dotenv").config(); // Load .env variables

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const BlogRoutes = require("./routes/BlogRoutes");

// Create Express app
const app = express();

// --------------------
// MongoDB Connection
// --------------------
const mongoURL = process.env.MONGO_URI;
if (!mongoURL) {
  console.error("❌ MONGO_URI not set in environment variables");
  process.exit(1);
}

mongoose.connect("mongodb://127.0.0.1:27017/blogApp")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --------------------
// Middlewares
// --------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Session setup
// --------------------
const sessionSecret = process.env.SESSION_SECRET || "mysecretkey";

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

// --------------------
// View Engine
// --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------------------
// Routes
// --------------------
app.use("/", authRoutes);       // login, signup, forgot password
app.use("/", userRoutes);       // profile, update profile
app.use("/", BlogRoutes);       // blog CRUD

// --------------------
// 404 Page
// --------------------
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
