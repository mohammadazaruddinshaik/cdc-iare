const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty');
const Announcement=require('../models/Announcement');
const getAttendanceModel = require('../services/GetAttendanceModel');
const Student=require('../models/student');
const ExcelJS = require("exceljs");



async function HandelPostAnnouncements(req, res) {
    
  try {
    const { postedby, title, subtitle, content, batches } = req.body;

    // Basic validation
    if (
      !postedby ||
      !title ||
      !subtitle ||
      !content ||
      !Array.isArray(batches) ||
      batches.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required and batches must be a non-empty array." });
    }

    // Create and save announcement
    const newAnnouncement = new Announcement({
      postedby,
      title,
      subtitle,
      content,
      batches,
      createdAt: new Date(), // optional, auto-set by schema too
    });

    const saved = await newAnnouncement.save();
    res.status(201).json({
      message: "Announcement posted successfully",
      announcementId: saved._id,
    });

  } catch (error) {
    console.error("Error posting announcement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function HandleMarkAttendance(req, res) {
  try {
    const { collectionName, date, course, presentArrays } = req.body;

    // 🛡️ Input validation
    if (!collectionName || !date || !course || !Array.isArray(presentArrays)) {
      return res.status(400).json({ message: 'Missing or invalid input data' });
    }

    const Attendance = getAttendanceModel(collectionName);
    const presentSet = new Set(presentArrays.map(s => s.rollno));
    const attendanceDocs = await Attendance.find(); // Get all students for this collection

    const bulkUpdates = [];
    const updatedStudents = [];
    const now = new Date();

    for (const doc of attendanceDocs) {
      const { rollno, dailyLogs } = doc;
      const isPresent = presentSet.has(rollno);

      let hasCourseMarkedToday = false;
      let hasAnyMarkedToday = false;

      for (const log of dailyLogs) {
        if (log.date === date) {
          hasAnyMarkedToday = true;
          if (log.course === course) {
            hasCourseMarkedToday = true;
            break;
          }
        }
      }

      if (hasCourseMarkedToday) continue; // Skip if already marked for this course today

      const newLog = {
        date,
        course,
        status: isPresent ? 'present' : 'absent'
      };

      const incOps = {
        [`courseAttendance.${course}.totalDays`]: 1
      };

      if (isPresent) {
        incOps[`courseAttendance.${course}.presentDays`] = 1;
      }

      if (!hasAnyMarkedToday) {
        incOps['overallAttendance.totalDays'] = 1;
        if (isPresent) {
          incOps['overallAttendance.presentDays'] = 1;
        }
      }

      bulkUpdates.push({
        updateOne: {
          filter: { rollno },
          update: {
            $push: { dailyLogs: newLog },
            $inc: incOps,
            $set: { lastUpdated: now }
          }
        }
      });

      updatedStudents.push({ rollno, status: newLog.status });
    }

    if (bulkUpdates.length > 0) {
      await Attendance.bulkWrite(bulkUpdates);
    }

    res.status(200).json({
      message: 'Attendance marked successfully for the course',
      count: updatedStudents.length,
      details: updatedStudents
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function HandleAttendanceReport(req, res) {
  try {
    const { batch } = req.params;

    if (!batch) {
      return res.status(400).json({ error: "Batch is required" });
    }

    // Fetch students based on batch
    const studentQuery = batch.toLowerCase() === "all" ? {} : { batch };
    const students = await Student.find(studentQuery);

    if (!students.length) {
      return res.status(404).json({ error: "No students found for this batch" });
    }

    // Prepare report using dynamic attendance models
    const report = await Promise.all(
      students.map(async (student) => {
        const attendanceCollectionName = `attendance_${student.batch}`;
        const Attendance = getAttendanceModel(attendanceCollectionName);

        const attendance = await Attendance.findOne({ rollno: student.rollno });

        return {
          rollno: student.rollno,
          name: student.name,
          branch: student.branch,
          batch: student.batch,
          overallAttendance: attendance?.overallAttendance || { totalDays: 0, presentDays: 0 },
          courseAttendance: attendance?.courseAttendance || {},
          dailyLogs: attendance?.dailyLogs || []
        };
      })
    );

    res.json({ report });
  } catch (err) {
    console.error("Error generating attendance report:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function HandleAttendanceReportExcel(req, res) {
  try {
    const { batch } = req.body;

    if (!batch) {
      return res.status(400).json({ error: "Batch is required" });
    }

    // Fetch students based on batch
    const studentQuery = batch.toLowerCase() === "all" ? {} : { batch };
    const students = await Student.find(studentQuery);

    if (!students.length) {
      return res.status(404).json({ error: "No students found for this batch" });
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    // Define columns
    worksheet.columns = [
      { header: "Roll No", key: "rollno", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Branch", key: "branch", width: 15 },
      { header: "Batch", key: "batch", width: 15 },
      { header: "Total Days", key: "totalDays", width: 12 },
      { header: "Present Days", key: "presentDays", width: 12 },
      { header: "Course Attendance", key: "courseAttendance", width: 50 },
      { header: "Daily Logs", key: "dailyLogs", width: 50 }
    ];

    // Fill rows
    for (let student of students) {
      const attendanceCollectionName = `attendance_${student.batch}`;
      const Attendance = getAttendanceModel(attendanceCollectionName);

      const attendance = await Attendance.findOne({ rollno: student.rollno });

      worksheet.addRow({
        rollno: student.rollno,
        name: student.name,
        branch: student.branch,
        batch: student.batch,
        totalDays: attendance?.overallAttendance?.totalDays || 0,
        presentDays: attendance?.overallAttendance?.presentDays || 0,
        courseAttendance: attendance?.courseAttendance
          ? JSON.stringify(Object.fromEntries(attendance.courseAttendance))
          : "{}",
        dailyLogs: attendance?.dailyLogs ? JSON.stringify(attendance.dailyLogs) : "[]"
      });
    }

    // Set response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_report_${batch || "all"}.xlsx`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error generating Excel report:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports={
    HandelPostAnnouncements,
    HandleMarkAttendance,
    HandleAttendanceReport,
    HandleAttendanceReportExcel
}