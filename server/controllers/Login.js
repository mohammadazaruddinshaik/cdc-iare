const jwt = require("jsonwebtoken");
const Student = require("../models/student");
const Faculty = require("../models/faculty");
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

async function HandleLogin(req, res) {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const getRole = (username) => {
        if (username.startsWith('2')) return 'student';
        if (username.toUpperCase().startsWith('IARE')) return 'faculty';
        if (username.toLowerCase().startsWith('cdc')) return 'admin';
        return null; // Return null if no role matches
    };
        const role=getRole(username);
        // console.log(role);
        // Pick the correct model & identifier field
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
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Case-insensitive search
        const query = {};
        query[identifierKey] = new RegExp(`^${username}$`, "i");
        const user = await Model.findOne(query);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        // console.log(user.password);
        // console.log(await bcrypt.hash(password,10));
        // ✅ Compare entered password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Pick identifier value for token payload
        const identifier = role === "student" ? user.rollno :
                           role === "faculty" ? user.facultyid :
                           user.adminId;

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role, username: identifier },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        // Set cookie with JWT
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true only in prod
            sameSite: "Strict", // safer default (use "None" if cross-site)
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        return res.json({ message: "Login successful", role, username: identifier });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = { HandleLogin };
