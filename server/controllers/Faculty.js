const express = require('express');
const Faculty = require('../models/faculty');
const Announcement = require('../models/Announcement');
const getAttendanceModel = require('../services/GetAttendanceModel');
const Student = require('../models/student');
const Coder = require('../models/coding')
const ExcelJS = require("exceljs");
const mongoose = require('mongoose');
const attendanceSchema = require('../models/attendance.model'); // export schema only, not model
const PDFDocument = require("pdfkit");
const crypto = require("crypto");

function getShortBatchName(fullBatchName) {
  const parts = fullBatchName.toUpperCase().split(" ");
  let code = "NA";
  if (parts[0] === "SKILLUP") {
    code = "SU";
  } else if (parts[0] === "SKILLNEXT") {
    code = "SN";
  } else if (parts[0] === "SKILLBRIDGE") {
    code = "SB";
  }

  const number = parts.find((p) => p.includes("-"))?.split("-").pop() || "";
  return `V-${code}-${number}`;
}
 

const drawTableHeaders = (doc, y) => {
  const tableColumns = [
    { label: "S.No", width: 40, align: "center" },
    { label: "Roll No", width: 90, align: "center" },
    { label: "Name", width: 200, align: "left" },
    { label: "Branch", width: 100, align: "center" },
    { label: "Status", width: 60, align: "center" }
  ];

  let currentX = doc.page.margins.left;
  const headerHeight = 20;

  // Draw a solid background for the header row
  doc.fillColor("#34495e").rect(currentX, y, 540, headerHeight).fill();

  // Draw header text
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#FFFFFF");
  tableColumns.forEach(column => {
    doc.text(column.label, currentX, y + 5, {
      width: column.width,
      align: column.align
    });
    currentX += column.width;
  });

  // Reset font and color for subsequent rows
  doc.font("Helvetica").fontSize(10).fillColor("#000000");

  return y + headerHeight;
};

const drawTable = (doc, data, { title, totalSummary, presentSummary, absentSummary }) => {
  doc.moveDown(1.5);

  // Section Title
  doc.font("Helvetica-Bold").fontSize(14).text(title, { align: "center" });
  doc.moveDown(0.5);

  const tableColumns = [
    { key: "sno", width: 40, align: "center" },
    { key: "rollno", width: 90, align: "center" },
    { key: "name", width: 200, align: "left" },
    { key: "branch", width: 100, align: "center" },
    { key: "status", width: 60, align: "center" }
  ];
  const rowHeight = 20;

  // Draw initial headers
  let y = drawTableHeaders(doc, doc.y);

  // Draw table data with alternating and conditional row colors
  doc.font("Helvetica").fontSize(10);
  let sno = 1;

  data.forEach((entry, index) => {
    const isPresent = entry.isPresent;
    const statusText = isPresent ? "Present" : "Absent";
    const statusColor = isPresent ? "#2E7D32" : "#C62828";
    const rowBgColor = index % 2 === 0 ? "#F5F5F5" : "#FFFFFF"; // Alternating row color

    // Check for new page and redraw headers if necessary
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top + 30;
      y = drawTableHeaders(doc, y);
    }

    // Draw row background
    doc.fillColor(rowBgColor).rect(doc.page.margins.left, y, 540, rowHeight).fill();

    const rowData = [
      sno.toString(),
      entry.student.rollno,
      entry.student.name,
      entry.student.branch || "UNKNOWN",
      statusText
    ];

    let currentX = doc.page.margins.left;
    rowData.forEach((text, i) => {
      // Apply conditional color and font for the status column
      if (tableColumns[i].key === "status") {
        doc.fillColor(statusColor).font("Helvetica-Bold");
      } else {
        doc.fillColor("#000000").font("Helvetica");
      }

      doc.text(text, currentX, y + 5, {
        width: tableColumns[i].width,
        align: tableColumns[i].align
      });
      currentX += tableColumns[i].width;
    });

    y += rowHeight;
    sno++;
  });

  // Draw summary section
  doc.moveDown(1.5);
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000");

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const currentY = doc.y;

  if (totalSummary && presentSummary && absentSummary) {
    // Combined report summary
    doc.text(totalSummary, doc.page.margins.left, currentY, { width: pageWidth / 3, align: "left" });
    doc.fillColor("#2E7D32").text(presentSummary, doc.page.margins.left + pageWidth / 3, currentY, { width: pageWidth / 3, align: "center" });
    doc.fillColor("#C62828").text(absentSummary, doc.page.margins.left + (pageWidth * 2 / 3), currentY, { width: pageWidth / 3, align: "right" });
  } else if (absentSummary) {
    // Absent-only report summary
    doc.fillColor("#C62828").text(absentSummary, { align: "center" });
  } else if (presentSummary) {
    // Present-only report summary
    doc.fillColor("#2E7D32").text(presentSummary, { align: "center" });
  }
};

async function getDashboardData(req, res) {
  try {
    const { facultyid } = req.params;
    if (!facultyid) {
      return res.status(400).json({ error: "facultyid is required" });
    }

    // 1. Get student profile (only rollno and batch)
    const faculty = await Faculty.findOne({
      facultyid: new RegExp(`^${facultyid}$`, "i")   // "i" = case-insensitive
    })
      .select("facultyid batches_assigned -_id");

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }


    // 2. Get top 3 coders overall (sorted by performance)
    const topCoders = await Coder.find()
      .sort({ totalScore: -1 }) // descending
      .limit(3)
      .select("rollno scores totalScore -_id");

    res.json({
      faculty: faculty,
      topCoders
    });

  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getStudentData(req, res) {
  try {

    const { rollno } = req.params;
    if (!rollno) {
      return res.status(400).json({ error: "rollno is required" });
    }

    // 1. Get student profile (only rollno and batch)
    const student = await Student.findOne({
      rollno: new RegExp(`^${rollno}$`, "i")   // "i" = case-insensitive
    })
      .select("rollno batch branch email -_id");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);

  } catch (error) {
    console.error("Error fetching Timetable data:", err);
    res.status(500).json({ error: "Server error" });
  }

}

async function getProfileData(req, res) {
  try {
    const { facultyid } = req.params;
    if (!facultyid) {
      return res.status(400).json({ error: "facultyid is required" });
    }

    const faculty = await Faculty.findOne({
      facultyid: new RegExp(`^${facultyid}$`, "i")
    }).select("name facultyid batches_assigned subjects_assigned email -_id");
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    res.json({ faculty });

  } catch (err) {
    console.error("Error fetching Faculty data:", err);
    res.status(500).json({ error: "Server error" });
  }
}

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
    const { collectionName, date, course, presentMap } = req.body;

    // 🛡️ Input validation
    if (!collectionName || !date || !course || typeof presentMap !== "object") {
      return res.status(400).json({ message: "Missing or invalid input data" });
    }

    const Attendance = getAttendanceModel(collectionName);
    const now = new Date();

    // Normalize date
    const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];
    const reqDate = normalizeDate(date);

    // Get attendance docs (for updating attendance collection)
    const attendanceDocs = await Attendance.find();

    // 🔍 Check if attendance already marked for this course & date
    const alreadyMarkedDocs = attendanceDocs.filter(doc =>
      doc.dailyLogs.some(log =>
        normalizeDate(log.date) === reqDate && log.course === course
      )
    );

    if (alreadyMarkedDocs.length > 0) {
      // Count present & absent from already marked logs
      let presentiesCount = 0;
      let absenteesCount = 0;

      for (const doc of alreadyMarkedDocs) {
        const log = doc.dailyLogs.find(
          l => normalizeDate(l.date) === reqDate && l.course === course
        );
        if (log) {
          if (log.status === "present") presentiesCount++;
          else absenteesCount++;
        }
      }

      return res.status(400).json({
        message: `Attendance already posted for this batch: ${course} on ${reqDate}`
      });
    }

    // 🎯 Validate QR hash using Student collection
    const rollnos = Object.keys(presentMap); // rollnos sent in request
    const students = await Student.find(
      { rollno: { $in: rollnos } },
      { rollno: 1, qrData: 1 }
    );

    // Build a set of rollnos validated by QR + track mismatches
    const validatedPresentSet = new Set();
    const mismatchedStudents = [];

    for (const student of students) {
      const expectedHash = student.qrData; // stored hash
      const providedHash = presentMap[student.rollno]; // hash from client
      if (expectedHash && providedHash && expectedHash === providedHash) {
        validatedPresentSet.add(student.rollno);
      } else {
        mismatchedStudents.push(student.rollno);
      }
    }

    const bulkUpdates = [];
    const updatedStudents = [];

    // 🚀 Process each student in attendance collection
    for (const doc of attendanceDocs) {
      const { rollno, dailyLogs } = doc;
      const isPresent = validatedPresentSet.has(rollno);

      const hasAnyMarkedToday = dailyLogs.some(
        log => normalizeDate(log.date) === reqDate
      );

      const newLog = {
        date,
        course,
        status: isPresent ? "present" : "absent"
      };

      const incOps = {
        [`courseAttendance.${course}.totalDays`]: 1
      };

      if (isPresent) {
        incOps[`courseAttendance.${course}.presentDays`] = 1;
      }

      if (!hasAnyMarkedToday) {
        incOps["overallAttendance.totalDays"] = 1;
        if (isPresent) {
          incOps["overallAttendance.presentDays"] = 1;
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

    // 📊 Count present & absent students
    const presentiesCount = updatedStudents.filter(s => s.status === "present").length;
    const absenteesCount = updatedStudents.filter(s => s.status === "absent").length;

    return res.status(200).json({
      message: `Attendance marked successfully for course: ${course} on ${reqDate}`,
      totalMarked: updatedStudents.length,
      presentiesCount,
      absenteesCount,
      mismatchedStudents
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}




module.exports = {
  getDashboardData,
  getStudentData,
  getProfileData,
  HandelPostAnnouncements,
  HandleMarkAttendance
}