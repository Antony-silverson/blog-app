const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/blogApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false,
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", blogRoutes);

// 404 Page
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
