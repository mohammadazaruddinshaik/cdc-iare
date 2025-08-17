const jwt = require("jsonwebtoken");
const Student = require('../models/student');
const Faculty = require('../models/faculty');
const Admin = require('../models/admin');
const bcrypt = require("bcryptjs");


async function HandleLogin(req, res) {
    try {
        console.log(req.body)
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Choose collection based on role
        let Model, Check;
        if (role === "student") { Model = Student; Check = "rollno"; }
        else if (role === "faculty") { Model = Faculty; Check = "facultyid"; }
        else if (role === "admin") { Model = Admin; Check = "adminId"; }
        else return res.status(400).json({ error: "Invalid role" });

        // Case-insensitive search
        const query = {};
        query[Check] = new RegExp(`^${username}$`, "i");
        const user = await Model.findOne(query);

        if (!user) return res.status(401).json({ error: "User not found" });

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid password" });

        // Create token
        const identifier = role === "student" ? user.rollno :
            role === "faculty" ? user.facultyid :
                user.adminId;

        const token = jwt.sign(
            { id: user._id, role: role, username: identifier },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,   // use true in production with https
            sameSite: "None",
            maxAge: 10 * 60 * 1000
        });

        res.json({ message: "Login successful" });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}



module.exports = {
    HandleLogin
}