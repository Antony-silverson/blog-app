// ===============================================
// 📝 Blog Routes (CRUD)
// ===============================================
const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// ✅ Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// 🏠 Home Page - show all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user").sort({ date: -1 });
    res.render("home", { blogs, user: req.session.user });
  } catch (err) {
    console.error("Error loading home:", err);
    res.status(500).send("Error loading blogs.");
  }
});

// ➕ Add New Blog Form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("add-blog", { user: req.session.user });
});

// 🧾 Create New Blog
router.post("/add", isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.send("<h3>Title and content are required.</h3>");

    await Blog.create({
      title,
      content,
      user: req.session.user._id,
    });

    res.redirect("/");
  } catch (err) {
    console.error("Error adding blog:", err);
    res.status(500).send("Error adding blog.");
  }
});

// ✏️ Edit Blog Page
router.get("/edit-blog/:id", isLoggedIn, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");

    if (blog.user.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    res.render("edit", { blog, user: req.session.user });
  } catch (err) {
    console.error("Error loading edit page:", err);
    res.status(500).send("Error loading edit page.");
  }
});

// 🔁 Update Blog
router.put("/edit-blog/:id", isLoggedIn, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");

    if (blog.user.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    blog.title = req.body.title;
    blog.content = req.body.content;
    await blog.save();

    res.redirect("/");
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).send("Error updating blog.");
  }
});

// 🗑️ Delete Blog
router.delete("/delete-blog/:id", isLoggedIn, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");

    if (blog.user.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).send("Error deleting blog.");
  }
});

module.exports = router;
