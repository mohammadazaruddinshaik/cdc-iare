const Student = require('../models/student');
const Faculty = require('../models/faculty');
const Admin = require('../models/admin');
const bcrypt = require("bcryptjs");

async function HandleChangePassword(req, res) {
    try {
        const { username, role, oldPassword, newPassword } = req.body;

        // Pick correct model
        let Model, Check;
        if (role === "student") { Model = Student; Check = "rollno"; }
        else if (role === "faculty") { Model = Faculty; Check = "facultyid"; }
        else if (role === "admin") { Model = Admin; Check = "adminId"; }
        else return res.status(400).json({ error: "Invalid role" });

        const query = {};
        query[Check] = new RegExp(`^${username}$`, "i");
        const user = await Model.findOne(query);

        if (!user) return res.status(404).json({ error: "User not found" });

        // Check old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: "Old password is incorrect" });

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Password change error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function HandleResetPassword(req, res) {
    try {
        const { username, role, ResetPassword } = req.body;

        // Pick correct model
        let Model, Check;
        if (role === "student") { Model = Student; Check = "rollno"; }
        else if (role === "faculty") { Model = Faculty; Check = "facultyid"; }
        else if (role === "admin") { Model = Admin; Check = "adminId"; }
        else return res.status(400).json({ error: "Invalid role" });

        const query = {};
        query[Check] = new RegExp(`^${username}$`, "i");
        const user = await Model.findOne(query);

        if (!user) return res.status(404).json({ error: "User not found" });

        // // Check old password
        // const isMatch = await bcrypt.compare(oldPassword, user.password);
        // if (!isMatch) return res.status(401).json({ error: "Old password is incorrect" });

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(ResetPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: "Password Reset successfully" });

    } catch (err) {
        console.error("Password change error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports={
    HandleChangePassword,
    HandleResetPassword
}