const Coder=require('../models/coding');
const Student = require('../models/student');
const Faculty = require('../models/faculty');
const Admin = require('../models/admin');
const bcrypt = require("bcryptjs");

async function getLeaderBoardData(req, res) {
  try {

    // Get all coders sorted by totalScore
    let AllCoders = await Coder.find()
      .sort({ totalScore: -1 })
      .select("rollno batch handles scores totalScore -_id")
      .lean(); // <-- use lean() so we can freely modify objects

    // Convert handles into URLs
    AllCoders = AllCoders.map(coder => {
      const h = coder.handles || {};
      return {
        ...coder,
        handles: {
          leetcode: h.leetcode ? `https://leetcode.com/u/${h.leetcode}` : null,
          gfg: h.gfg ? `https://www.geeksforgeeks.org/user/${h.gfg}/` : null,
          codechef: h.codechef ? `https://www.codechef.com/users/${h.codechef}` : null,
          hackerank: h.hackerank ? `https://www.hackerrank.com/profile/${h.hackerank}` : null
        }
      };
    });

    res.json({ AllCoders });

  } catch (err) {
    console.error("Error fetching leaderboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

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
    const { username, role, targetRole, ResetPassword } = req.body;
    // 👆 added `targetRole` → whose password is being reset

    if (!username || !role || !targetRole || !ResetPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // permission checks
    if (role === "student") {
      return res.status(403).json({ error: "Students are not allowed to reset passwords" });
    }

    if (role === "faculty" && targetRole !== "student") {
      return res.status(403).json({ error: "Faculty can reset only student passwords" });
    }

    if (role === "admin" && !["student", "faculty"].includes(targetRole)) {
      return res.status(403).json({ error: "Admin can reset only student or faculty passwords" });
    }

    // pick correct model based on targetRole
    let Model, Check;
    if (targetRole === "student") { Model = Student; Check = "rollno"; }
    else if (targetRole === "faculty") { Model = Faculty; Check = "facultyid"; }
    else if (targetRole === "admin") { Model = Admin; Check = "adminId"; }
    else return res.status(400).json({ error: "Invalid target role" });

    const query = {};
    query[Check] = new RegExp(`^${username}$`, "i");

    const user = await Model.findOne(query);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(ResetPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: `Password reset successfully for ${targetRole} ${username}` });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getViewStudentData(req, res) {
  try {
    // 1. Get all students
    let students = await Student.find()
      .select("rollno name batch -_id")
      .lean();

    // 2. For each student, fetch attendance
    const AllStudents = await Promise.all(
      students.map(async (student) => {
        try {
          // format batch name into collectionName
          const batchFormatted = student.batch
            .replace(/BATCH/gi, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase();

          const collectionName = `attendance_${batchFormatted}`;
          const AttendanceModel = mongoose.model(
            collectionName,
            attendanceSchema,
            collectionName
          );

          // find attendance by rollno
          let attendance = await AttendanceModel.findOne({
            rollno: new RegExp(`^${student.rollno}$`, "i"),
          })
            .select("overallAttendance courseAttendance dailyLogs -_id")
            .lean(); // <-- important: bypass schema casting

          // strip _id from dailyLogs
          if (attendance && attendance.dailyLogs) {
            attendance.dailyLogs = attendance.dailyLogs.map(({ _id, ...rest }) => rest);
          }

          // merge student + attendance
          return {
            ...student,
            ...(attendance || {}) // spread only if attendance exists
          };
        } catch (err) {
          console.error(`Error fetching attendance for ${student.rollno}:`, err);
          return student; // fallback to just student info
        }
      })
    );

    res.json({ AllStudents });
  } catch (err) {
    console.error("Error fetching Students data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports={
    getLeaderBoardData,
    HandleChangePassword,
    HandleResetPassword,
    getViewStudentData
}