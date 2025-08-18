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
      .select("rollno batch branch email");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);

  } catch (error) {
    console.error("Error fetching Timetable data:", err);
    res.status(500).json({ error: "Server error" });
  }

}

async function getTimetableData(req, res) {
  try {
    const { facultyid } = req.params;
    if (!facultyid) {
      return res.status(400).json({ error: "facultyid is required" });
    }

    // 1. Get faculty profile (only id and batches)
    const faculty = await Faculty.findOne({
      facultyid: new RegExp(`^${facultyid}$`, "i")   // "i" = case-insensitive
    })
      .select("facultyid batches_assigned -_id");

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    res.json({
      Faculty: faculty
    });

  } catch (err) {
    console.error("Error fetching Timetable data:", err);
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

    // 📊 Count present & absent students
    const presentiesCount = updatedStudents.filter(s => s.status === "present").length;
    const absenteesList = updatedStudents
      .filter(s => s.status === "absent")
      .map(s => s.rollno);

    res.status(200).json({
      message: 'Attendance marked successfully for the course',
      totalMarked: updatedStudents.length,
      presentiesCount,
      absenteesList,
      details: updatedStudents
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function HandleAttendanceReportPDF(req, res) {
  try {
    const { batch, date } = req.body;
    if (!batch || !date) {
      return res.status(400).json({ message: "Missing batch or date parameter" });
    }

    const reportDate = date;
    const displayDate = new Date(date).toLocaleDateString("en-GB").split("/").join("-");

    const Attendance = getAttendanceModel(batch);
    const attendanceRecords = await Attendance.find({});
    const sampleStudent = await Student.findOne({ rollno: attendanceRecords[0]?.rollno });
    const batchName = sampleStudent?.batch || "UNKNOWN BATCH";
    const shortBatchName = getShortBatchName(batchName);

    const students = await Student.find({ batch: batchName }).sort({ branch: 1, rollno: 1 });

    // Compute presence for all students
    const allStudentData = students.map((student) => {
      const attendance = attendanceRecords.find((a) => a.rollno === student.rollno);
      const isPresent = attendance?.dailyLogs?.some((log) => log.date === reportDate && log.status === "present") || false;
      return { student, isPresent };
    });

    // Separate students into present and absent lists
    const absentStudents = allStudentData.filter((entry) => !entry.isPresent);
    const presentStudents = allStudentData.filter((entry) => entry.isPresent);

    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const filename = `${shortBatchName}_${displayDate}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Main Document Header
    doc.fontSize(16).font("Helvetica-Bold").text("Institute of Aeronautical Engineering", { align: "center" });
    doc.fontSize(12).font("Helvetica").text("Career Development Center", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica-Bold").text(`PAT Attendance Summary`, { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Date: ${displayDate}`, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(11).font("Helvetica-Bold").text(`Batch: ${shortBatchName}`);
    doc.moveDown(0.5);

    // --- Section 1: Complete Report ---
    const totalSummaryText = `Total Students: ${allStudentData.length}`;
    const presentSummaryText = `Present: ${presentStudents.length}`;
    const absentSummaryText = `Absent: ${absentStudents.length}`;
    drawTable(doc, allStudentData, { 
        title: "Complete Report (Present & Absent)", 
        totalSummary: totalSummaryText,
        presentSummary: presentSummaryText,
        absentSummary: absentSummaryText
    });

    // --- Section 2: Absent Only List ---
    if (absentStudents.length > 0) {
      doc.addPage();
      const absentSummary = `Total Absentees: ${absentStudents.length}`;
      drawTable(doc, absentStudents, { 
          title: "Absent Only Report", 
          absentSummary: absentSummary 
      });
    }

    // --- Section 3: Present Only List ---
    if (presentStudents.length > 0) {
      doc.addPage();
      const presentSummary = `Total Present: ${presentStudents.length}`;
      drawTable(doc, presentStudents, { 
          title: "Present Only Report", 
          presentSummary: presentSummary 
      });
    }

    doc.end();
  } catch (err) {
    console.error("Error generating attendance PDF:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function HandleAttendanceReportExcel(req, res) {
  try {
    const { batch, date } = req.body;
    if (!batch || !date) {
      return res.status(400).json({ message: "Missing batch or date parameter" });
    }

    const reportDate = date;
    const displayDate = new Date(date).toLocaleDateString("en-GB").split("/").join("-");

    const Attendance = getAttendanceModel(batch);
    const attendanceRecords = await Attendance.find({});
    const sampleStudent = await Student.findOne({ rollno: attendanceRecords[0]?.rollno });
    const batchName = sampleStudent?.batch || "UNKNOWN BATCH";
    const shortBatchName = getShortBatchName(batchName);

    const students = await Student.find({ batch: batchName }).sort({ branch: 1, rollno: 1 });

    // Compute presence for all students
    const allStudentData = students.map((student) => {
      const attendance = attendanceRecords.find((a) => a.rollno === student.rollno);
      const isPresent = attendance?.dailyLogs?.some((log) => log.date === reportDate && log.status === "present") || false;
      return {
        sno: '', // Placeholder for S.No
        rollno: student.rollno,
        name: `${student.firstName} ${student.lastName}`.trim(),
        branch: student.branch,
        status: isPresent ? "Present" : "Absent"
      };
    });

    const absentStudents = allStudentData.filter((entry) => entry.status === "Absent");
    const presentStudents = allStudentData.filter((entry) => entry.status === "Present");

    const workbook = new ExcelJS.Workbook();
    const filename = `${shortBatchName}_${displayDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // --- Helper function to create and populate a worksheet ---
    const createWorksheet = (sheetName, data, headers) => {
      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = headers;
      
      let sno = 1;
      data.forEach(item => {
        worksheet.addRow({ ...item, sno: sno });
        sno++;
      });

      // Optional: Style the headers
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF34495E' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' } };
      });

      // Optional: Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = column.header.length < 12 ? 12 : column.header.length + 2;
      });
    };

    const commonHeaders = [
      { header: 'S.No', key: 'sno' },
      { header: 'Roll No', key: 'rollno' },
      { header: 'Name', key: 'name' },
      { header: 'Branch', key: 'branch' },
      { header: 'Status', key: 'status' }
    ];

    // --- Section 1: Complete Report ---
    createWorksheet('Complete Report', allStudentData, commonHeaders);

    // --- Section 2: Absent Only List ---
    if (absentStudents.length > 0) {
      const absentHeaders = [
        { header: 'S.No', key: 'sno' },
        { header: 'Roll No', key: 'rollno' },
        { header: 'Name', key: 'name' },
        { header: 'Branch', key: 'branch' }
      ];
      const absentDataForExcel = absentStudents.map(student => ({ ...student, status: undefined }));
      createWorksheet('Absent Students', absentDataForExcel, absentHeaders);
    }

    // --- Section 3: Present Only List ---
    if (presentStudents.length > 0) {
      const presentHeaders = [
        { header: 'S.No', key: 'sno' },
        { header: 'Roll No', key: 'rollno' },
        { header: 'Name', key: 'name' },
        { header: 'Branch', key: 'branch' }
      ];
      const presentDataForExcel = presentStudents.map(student => ({ ...student, status: undefined }));
      createWorksheet('Present Students', presentDataForExcel, presentHeaders);
    }

    // Write the workbook to the response stream
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error generating attendance Excel:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = {
  getDashboardData,
  getLeaderBoardData,
  getStudentData,
  getTimetableData,
  getViewStudentData,
  getProfileData,
  HandelPostAnnouncements,
  HandleMarkAttendance,
  HandleAttendanceReportExcel,
  HandleAttendanceReportPDF
}