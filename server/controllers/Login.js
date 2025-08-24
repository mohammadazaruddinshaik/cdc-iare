const jwt = require("jsonwebtoken");
const Student = require("../models/student");
const Faculty = require("../models/faculty");
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

async function HandleLogin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Identify role by username prefix
    const getRole = (u) => {
      if (u.startsWith("2")) return "student";                 // rollno
      if (u.toUpperCase().startsWith("IARE")) return "faculty"; // facultyid
      if (u.toLowerCase().startsWith("cdc")) return "admin";    // adminId
      return null;
    };
    const role = getRole(username);
    if (!role) return res.status(400).json({ error: "Invalid role" });

    // Select model & identifier field
    let Model, identifierKey;
    if (role === "student") {
      Model = Student;
      identifierKey = "rollno";
    } else if (role === "faculty") {
      Model = Faculty;
      identifierKey = "facultyid";
    } else {
      Model = Admin;
      identifierKey = "adminId";
    }

    // Case-insensitive search
    const query = {};
    query[identifierKey] = new RegExp(`^${username}$`, "i");
    const user = await Model.findOne(query);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Identifier for token payload
    const identifier =
      role === "student" ? user.rollno :
      role === "faculty" ? user.facultyid :
      user.adminId;

    // Role-based expiry settings
    const jwtExpiry =
      role === "student" ? "15m" :
      role === "faculty" ? "60m" : "45m";

    const cookieMaxAge =
      role === "student" ? 15 * 60 * 1000 :
      role === "faculty" ? 60 * 60 * 1000 :
      45 * 60 * 1000;

    // Sign JWT
    const accessToken = jwt.sign(
      { id: user._id, role, username: identifier },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpiry }
    );

    // Send as HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in localhost
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: cookieMaxAge
    });

    return res.json({
      message: "Login successful",
      role,
      username: identifier
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { HandleLogin };
