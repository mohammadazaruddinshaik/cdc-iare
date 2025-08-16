const mongoose = require('mongoose');
const Student = require('../models/student');
const attendanceSchema = require('../models/attendance.model'); // export schema only, not model
const Coder=require('../models/coding')
const fetchLeetCode = require("../modules/leetcode");
const fetchGFG = require("../modules/gfg");
const fetchCodeChef = require("../modules/codechef");

async function HandleInformation(req, res) {
  try {
    const { rollno, batch } = req.body; // or req.body if sent in body

    // 1. Student profile
    const student = await Student.findOne({ rollno });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // 2. Pick the correct attendance collection dynamically
    const collectionName = `attendance_${batch.toLowerCase()}`;
    const AttendanceModel = mongoose.model(collectionName, attendanceSchema, collectionName);

    const attendance = await AttendanceModel.findOne({
      rollno: new RegExp(`^${rollno}$`, 'i')
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // 3. Last 7 days logs
    const today = new Date();
    const past7Days = new Date(today);
    past7Days.setDate(today.getDate() - 6);

    const dailyLogs = attendance.dailyLogs
      .filter(log => new Date(log.date) >= past7Days)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. Send combined data
    res.json({
      profile: student,
      attendance: {
        overallAttendance: attendance.overallAttendance,
        courseAttendance: attendance.courseAttendance,
        dailyLogs
      }
    });

  } catch (err) {
    console.error('Error fetching profile & attendance:', err);
    res.status(500).json({ error: 'Server error' });
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

module.exports={
    HandleInformation,
    updateAllStudentScores
}