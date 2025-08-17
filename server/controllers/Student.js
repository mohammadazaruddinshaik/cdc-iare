const mongoose = require('mongoose');
const Student = require('../models/student');
const attendanceSchema = require('../models/attendance.model'); // export schema only, not model
const Coder=require('../models/coding')
const fetchLeetCode = require("../modules/leetcode");
const fetchGFG = require("../modules/gfg");
const fetchCodeChef = require("../modules/codechef");
const Announcement = require("../models/Announcement");


async function getDashboardData(req, res) {
  try {
    const { rollno } = req.body;
    if (!rollno) {
      return res.status(400).json({ error: "rollno is required" });
    }

    // 1. Get student profile (only rollno and batch)
    const student = await Student.findOne({ 
  rollno: new RegExp(`^${rollno}$`, "i")   // "i" = case-insensitive
})
      .select("rollno batch");
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2. Get student's coding performance
    const studentCoding = await Coder.findOne({ rollno })
      .select("scores totalScore"); // assuming performance field exists

    // 3. Get top 3 coders overall (sorted by performance)
    const topCoders = await Coder.find()
      .sort({ totalScore: -1 }) // descending
      .limit(3)
      .select("rollno scores totalScore");

    // 4. Get attendance summary
    const batchFormatted = student.batch
      .replace(/BATCH/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    const collectionName = `attendance_${batchFormatted}`;
    const AttendanceModel = mongoose.model(collectionName, attendanceSchema, collectionName);

    const attendance = await AttendanceModel.findOne({ rollno: new RegExp(`^${rollno}$`, "i") })
      .select("overallAttendance courseAttendance");

    res.json({
      student: student,
      codingPerformance: studentCoding || {},
      topCoders,
      attendance: attendance || {}
    });

  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getLeaderBoardData(req, res) {
  try {
    const { rollno } = req.params; // <-- now comes from URL param
    if (!rollno) {
      return res.status(400).json({ error: "rollno is required" });
    }

    // Find student
    const student = await Coder.findOne({ 
  rollno: new RegExp(`^${rollno}$`, "i")   // "i" = case-insensitive
});
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get all coders sorted by totalScore
    const AllCoders = await Coder.find()
      .sort({ totalScore: -1 }) // descending
      .select("rollno batch handles scores totalScore");

    res.json({ AllCoders });

  } catch (err) {
    console.error("Error fetching leaderboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
}


async function getLogData(req, res) {
  try {
    const { rollno } = req.params;
    if (!rollno) {
      return res.status(400).json({ error: "rollno is required" });
    }

    const student = await Student.findOne({ 
  rollno: new RegExp(`^${rollno}$`, "i")   // "i" = case-insensitive
});
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }


    const batchFormatted = student.batch
      .replace(/BATCH/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    const collectionName = `attendance_${batchFormatted}`;
    const AttendanceModel = mongoose.model(collectionName, attendanceSchema, collectionName);

    const attendance = await AttendanceModel.findOne({ rollno: new RegExp(`^${rollno}$`, "i") })
      .select("dailyLogs");

      res.json({attendance});

  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getProfileData(req, res) {
  try {
    const { rollno } = req.body;
    if (!rollno) {
      return res.status(400).json({ error: "rollno is required" });
    }

    const student = await Student.findOne({ rollno }).select("name rollno branch batch email qrLink");
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

      res.json({student});

  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function updateAllStudentScores() {
  const students = await Coder.find();

  for (const student of students) {
    try {
      const { handles } = student;

      const leetcodeData = handles.leetcode
        ? await fetchLeetCode(handles.leetcode).catch(() => ({}))
        : {};
      const gfgData = handles.gfg
        ? await fetchGFG(handles.gfg).catch(() => ({}))
        : {};
      const codechefData = handles.codechef
        ? await fetchCodeChef(handles.codechef).catch(() => ({}))
        : {};

      const leetcodeScore =
        (leetcodeData.easy || 0) * 2 +
        (leetcodeData.medium || 0) * 4 +
        (leetcodeData.hard || 0) * 6;

      const normalizedRating = Math.max(
        0,
        Math.min(1, ((codechefData.rating || 0) - 1000) / (3500 - 1000))
      );
      const normalizedProblems = Math.max(
        0,
        Math.min(1, (codechefData.problemsSolved || 0) / 200)
      );

      const codechefScore = Math.round(
        (normalizedRating * 0.5 + normalizedProblems * 0.5) * 500
      );

      const gfgScore = gfgData.codingScore || 0;

      const totalScore = leetcodeScore + gfgScore + codechefScore;

      await Coder.updateOne(
        { rollno: student.rollno },
        {
          $set: {
            scores: {
              leetcode: leetcodeScore,
              gfg: gfgScore,
              codechef: codechefScore,
            },
            totalScore,
            lastUpdated: new Date(),
          },
        }
      );

      console.log(`✅ Updated: ${student.rollno}`);
    } catch (err) {
      console.error(`❌ Failed to update ${student.rollno}:`, err.message);
    }
  }
}

async function HandleGetAnnouncements(req, res) {
  
  try {
    const studentBatch = req.params.batch;

    if (!studentBatch) {
      return res.status(400).json({ message: "Batch parameter is required." });
    }

    const announcements = await Announcement.find(
      { batches: studentBatch },
      "title subtitle content" // Only these fields
    )
      .sort({ createdAt: -1 }) // Latest first
      .limit(3); // Top 3 only

    res.status(200).json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports={
    getDashboardData,
    updateAllStudentScores,
    HandleGetAnnouncements,
    getLeaderBoardData,
    getLogData,
    getProfileData
}