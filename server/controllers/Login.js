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

    // Identify role based on username pattern
    const getRole = (username) => {
      if (username.startsWith("2")) return "student";
      if (username.toUpperCase().startsWith("IARE")) return "faculty";
      if (username.toLowerCase().startsWith("cdc")) return "admin";
      return null;
    };

    const role = getRole(username);
    if (!role) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    // Select proper model and identifier
    let Model, identifierKey;
    if (role === "student") {
      Model = Student;
      identifierKey = "rollno";
    } else if (role === "faculty") {
      Model = Faculty;
      identifierKey = "facultyid";
    } else if (role === "admin") {
      Model = Admin;
      identifierKey = "adminId";
    }

    // Case-insensitive query
    const query = {};
    query[identifierKey] = new RegExp(`^${username}$`, "i");
    const user = await Model.findOne(query);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Password verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Determine identifier for payload
    const identifierValue =
      role === "student"
        ? user.rollno
        : role === "faculty"
        ? user.facultyid
        : user.adminId;

    // Token expiry times
    const jwtExpiry =
      role === "student" ? "15m" : role === "faculty" ? "60m" : "45m";
      role === "student" ? "15m" : role === "faculty" ? "60m" : "45m";

    const cookieMaxAge =
      role === "student"
        ? 15 * 60 * 1000
        : role === "faculty"
        ? 60 * 60 * 1000
        : 45 * 60 * 1000;
      role === "student"
        ? 15 * 60 * 1000
        : role === "faculty"
        ? 60 * 60 * 1000
        : 45 * 60 * 1000;

    // ✅ Sign JWT with role-specific identifier
    const accessToken = jwt.sign(
      {
        id: user._id,
        role,
        username: identifierValue, // still keep for display
        rollno: role === "student" ? user.rollno : undefined,
        facultyid: role === "faculty" ? user.facultyid : undefined,
        adminId: role === "admin" ? user.adminId : undefined,
      },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpiry }
    );

    // ✅ Send JWT as secure, HTTP-only cookie
    res.cookie("webToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: cookieMaxAge,
    });

    return res.json({
      message: "Login successful",
      role,
      username: identifierValue,
      expiresIn: jwtExpiry,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { HandleLogin };
