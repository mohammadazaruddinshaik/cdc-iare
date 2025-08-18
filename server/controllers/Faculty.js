const express = require('express');
const Faculty = require('../models/faculty');
const Announcement = require('../models/Announcement');
const getAttendanceModel = require('../services/GetAttendanceModel');
const Student = require('../models/student');
const Coder = require('../models/coding')
const ExcelJS = require("exceljs");
const mongoose = require('mongoose');
const attendanceSchema = require('../models/attendance.model'); // export schema only, not model
const student = require('../models/student');

function getShortBatchName(fullBatchName) {
  const parts = fullBatchName.toUpperCase().split(" ");
  let code =
    parts[0] === "SKILLUP"
      ? "SU"
      : parts[0] === "SKILLNEXT"
      ? "SN"
      : parts[0] === "SKILLBRIDGE"
      ? "SB"
      : "NA";

  const number =
    parts
      .find((p) => p.includes("-"))
      ?.split("-")
      .pop() || "";

  return `V-${code}-${number}`;
}

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

async function HandleAttendanceReport(req, res) {
  try {
    const collectionName = req.params.batch;
    if (!collectionName) {
      return res.status(400).json({ message: "Missing collectionName parameter" });
    }

    const reportDate = new Date().toISOString().slice(0, 10);
    const displayDate = new Date().toLocaleDateString("en-GB").split("/").join("-");

    const Attendance = getAttendanceModel(collectionName);
    const attendanceRecords = await Attendance.find({});

    const sampleAttendance = attendanceRecords[0];
    const sampleStudent = sampleAttendance
      ? await Student.findOne({ rollno: sampleAttendance.rollno })
      : null;

    const batchName = sampleStudent?.batch || "UNKNOWN BATCH";
    const shortBatchName = getShortBatchName(batchName);
    const students = await Student.find({ batch: batchName });

    const workbook = new ExcelJS.Workbook();

    const styleHeaders = (sheet, title) => {
      sheet.views = [{ state: 'normal' }];

      // Enhanced header styling with gradient colors and better fonts
      const headerRows = [
        ["Institute of Aeronautical Engineering", "1f4e79", 16, "FFFFFF"], // Dark blue background, white text
        [`PAT Attendance Summary - ${displayDate}`, "2e75b6", 14, "FFFFFF"], // Medium blue
        ["Career Development Center", "3d85c6", 12, "FFFFFF"], // Light blue
        [title, "4a90e2", 11, "FFFFFF"], // Lighter blue
      ];

      headerRows.forEach(([text, bgColor, fontSize, textColor], i) => {
        const row = sheet.addRow([text, "", "", "", "", ""]);
        sheet.mergeCells(`A${i + 1}:F${i + 1}`);
        
        row.getCell(1).font = { 
          bold: true, 
          size: fontSize,
          color: { argb: textColor },
          name: "Calibri"
        };
        row.getCell(1).alignment = { 
          horizontal: "center", 
          vertical: "middle" 
        };
        row.height = fontSize + 8; // Dynamic row height
        
        row.eachCell(cell => {
          cell.fill = { 
            type: "pattern", 
            pattern: "solid", 
            fgColor: { argb: bgColor } 
          };
          cell.border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
          };
        });
      });

      // Add spacing row
      const spacingRow = sheet.addRow(["", "", "", "", "", ""]);
      spacingRow.height = 5;
      spacingRow.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8F9FA" } };
      });

      // Enhanced column headers with better styling
      const headerRow = sheet.addRow(["S.No", "Roll No", "Name", "Branch", "Batch", "Status"]);
      headerRow.height = 25;
      
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = { 
          type: "pattern", 
          pattern: "solid", 
          fgColor: { argb: "34495e" } // Dark gray
        };
        cell.font = { 
          bold: true, 
          size: 12,
          color: { argb: "FFFFFF" },
          name: "Calibri"
        };
        cell.alignment = { 
          horizontal: "center", 
          vertical: "middle" 
        };
        cell.border = {
          top: { style: "medium", color: { argb: "000000" } },
          left: { style: "medium", color: { argb: "000000" } },
          bottom: { style: "medium", color: { argb: "000000" } },
          right: { style: "medium", color: { argb: "000000" } },
        };
      });

      // Enhanced column widths
      sheet.columns = [
        { key: "sno", width: 10 },
        { key: "roll", width: 18 },
        { key: "name", width: 35 },
        { key: "branch", width: 20 },
        { key: "batch", width: 25 },
        { key: "status", width: 16 },
      ];
    };

    const addStudentRows = (sheet, data, showAbsentCountOnly = false) => {
      let sr = 1;
      let absent = 0;
      let present = 0;

      data.forEach(({ student, isPresent }) => {
        if (!isPresent) {
          absent++;
        } else {
          present++;
        }

        const row = sheet.addRow([
          sr++,
          student.rollno,
          student.name,
          student.branch || "UNKNOWN",
          getShortBatchName(student.batch),
          isPresent ? "Present" : "Absent",
        ]);

        row.height = 22;

        row.eachCell((cell, colNumber) => {
          // Enhanced font styling
          cell.font = { 
            name: "Calibri", 
            size: 11,
            bold: colNumber === 6 // Make status column bold
          };
          
          // Better alignment
          cell.alignment = { 
            vertical: "middle", 
            horizontal: colNumber === 3 ? "left" : "center" 
          };
          
          // Enhanced borders
          cell.border = {
            top: { style: "thin", color: { argb: "CCCCCC" } },
            left: { style: "thin", color: { argb: "CCCCCC" } },
            bottom: { style: "thin", color: { argb: "CCCCCC" } },
            right: { style: "thin", color: { argb: "CCCCCC" } },
          };

          // Conditional formatting for status
          if (colNumber === 6) { // Status column
            if (isPresent) {
              cell.fill = { 
                type: "pattern", 
                pattern: "solid", 
                fgColor: { argb: "D4F3D0" } // Light green for present
              };
              cell.font = { 
                ...cell.font, 
                color: { argb: "2E7D32" } // Dark green text
              };
            } else {
              cell.fill = { 
                type: "pattern", 
                pattern: "solid", 
                fgColor: { argb: "FFEBEE" } // Light red for absent
              };
              cell.font = { 
                ...cell.font, 
                color: { argb: "C62828" } // Dark red text
              };
            }
          } else {
            // Alternating row colors for better readability
            const bgColor = (sr % 2 === 0) ? "F8F9FA" : "FFFFFF";
            cell.fill = { 
              type: "pattern", 
              pattern: "solid", 
              fgColor: { argb: bgColor } 
            };
          }
        });
      });

      // Enhanced summary section
      if (showAbsentCountOnly) {
        // Add spacing
        const spacingRow = sheet.addRow(["", "", "", "", "", ""]);
        spacingRow.height = 10;
        
        // Summary header
        const summaryHeaderRow = sheet.addRow(["", "", "SUMMARY", "", "", ""]);
        sheet.mergeCells(`C${summaryHeaderRow.number}:F${summaryHeaderRow.number}`);
        summaryHeaderRow.height = 25;
        
        summaryHeaderRow.getCell(3).font = { 
          bold: true, 
          size: 12,
          color: { argb: "FFFFFF" },
          name: "Calibri"
        };
        summaryHeaderRow.getCell(3).alignment = { 
          horizontal: "center", 
          vertical: "middle" 
        };
        summaryHeaderRow.getCell(3).fill = { 
          type: "pattern", 
          pattern: "solid", 
          fgColor: { argb: "3498DB" } // Blue background for header
        };
        summaryHeaderRow.getCell(3).border = {
          top: { style: "medium", color: { argb: "000000" } },
          left: { style: "medium", color: { argb: "000000" } },
          bottom: { style: "medium", color: { argb: "000000" } },
          right: { style: "medium", color: { argb: "000000" } },
        };
        
        // Summary data - Only show Absent count for branch-specific sheets
        const summaryRow = sheet.addRow(["", "", "", "", "", `Absent: ${absent}`]);
        summaryRow.height = 22;
        
        summaryRow.eachCell((cell, colNumber) => {
          if (colNumber === 6) {
            cell.font = { 
              bold: true, 
              size: 11,
              color: { argb: "FFFFFF" },
              name: "Calibri"
            };
            cell.alignment = { 
              horizontal: "center", 
              vertical: "middle" 
            };
            
            cell.fill = { 
              type: "pattern", 
              pattern: "solid", 
              fgColor: { argb: "E74C3C" } // Red background for Absent
            };
            
            cell.border = {
              top: { style: "thin", color: { argb: "000000" } },
              left: { style: "thin", color: { argb: "000000" } },
              bottom: { style: "thin", color: { argb: "000000" } },
              right: { style: "thin", color: { argb: "000000" } },
            };
          }
        });
      } else {
        // Add summary for complete report
        const spacingRow = sheet.addRow(["", "", "", "", "", ""]);
        spacingRow.height = 10;
        
        const summaryRow = sheet.addRow(["", "", "TOTAL SUMMARY", "", `Present: ${present}`, `Absent: ${absent}`]);
        sheet.mergeCells(`C${summaryRow.number}:D${summaryRow.number}`);
        summaryRow.height = 25;
        
        summaryRow.eachCell((cell, colNumber) => {
          if (colNumber >= 3) {
            cell.font = { 
              bold: true, 
              size: 11,
              color: { argb: "FFFFFF" },
              name: "Calibri"
            };
            cell.alignment = { 
              horizontal: "center", 
              vertical: "middle" 
            };
            
            if (colNumber === 3) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "3498DB" } }; // Blue
            } else if (colNumber === 5) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "27AE60" } }; // Green
            } else if (colNumber === 6) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E74C3C" } }; // Red
            }
            
            cell.border = {
              top: { style: "medium", color: { argb: "000000" } },
              left: { style: "medium", color: { argb: "000000" } },
              bottom: { style: "medium", color: { argb: "000000" } },
              right: { style: "medium", color: { argb: "000000" } },
            };
          }
        });
      }
    };

    // Compute presence
    const completeData = students.map(student => {
      const attendance = attendanceRecords.find(a => a.rollno === student.rollno);
      const logs = attendance?.dailyLogs?.filter(log => log.date === reportDate) || [];
      const isPresent = logs.some(log => log.status === "present");
      return { student, isPresent };
    });

    // Sort by Branch > Roll No
    const sortedData = [...completeData].sort((a, b) => {
      const branchA = (a.student.branch || "UNKNOWN").trim().toUpperCase();
      const branchB = (b.student.branch || "UNKNOWN").trim().toUpperCase();

      if (branchA === branchB) {
        return a.student.rollno.localeCompare(b.student.rollno);
      }
      return branchA.localeCompare(branchB);
    });

    // Sheet 1: Complete Report
    const completeSheet = workbook.addWorksheet("Complete Report");
    styleHeaders(completeSheet, `B.Tech V Semester - ${shortBatchName}(Both Present & Absent)`);
    addStudentRows(completeSheet, sortedData);

    // Branch-wise Absentee Sheets
    const branchMap = {};
    for (const entry of completeData) {
      const branch = (entry.student.branch || "UNKNOWN").trim().toUpperCase();
      if (!branchMap[branch]) branchMap[branch] = [];
      branchMap[branch].push(entry);
    }

    for (const branch of Object.keys(branchMap).sort()) {
      const absentees = branchMap[branch].filter(entry => !entry.isPresent);
      if (absentees.length === 0) continue;

      // ✅ Sort absentees by roll number for each branch
      const sortedAbsentees = absentees.sort((a, b) => {
        return a.student.rollno.localeCompare(b.student.rollno);
      });

      const sheetName = `${shortBatchName}_${branch}`.replace(/[\\\/\?\*\[\]]/g, "").slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName);
      styleHeaders(sheet, `B.Tech V Semester - ${shortBatchName}_${branch}(Absent Only)`);
      addStudentRows(sheet, sortedAbsentees, true);
    }

    const fileName = `${shortBatchName}_${displayDate}.xlsx`;
    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generating attendance report:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function HandleAttendanceReportExcel(req, res) {
  try {
    const collectionName = req.params.collectionName;
    if (!collectionName) {
      return res.status(400).json({ message: "Missing collectionName parameter" });
    }

    const reportDate = new Date().toISOString().slice(0, 10);
    const displayDate = new Date().toLocaleDateString("en-GB").split("/").join("-");

    const Attendance = getAttendanceModel(collectionName);
    const attendanceRecords = await Attendance.find({});

    const sampleAttendance = attendanceRecords[0];
    const sampleStudent = sampleAttendance
      ? await Student.findOne({ rollno: sampleAttendance.rollno })
      : null;

    const batchName = sampleStudent?.batch || "UNKNOWN BATCH";
    const shortBatchName = getShortBatchName(batchName);
    const students = await Student.find({ batch: batchName });

    // Compute presence
    const completeData = students.map(student => {
      const attendance = attendanceRecords.find(a => a.rollno === student.rollno);
      const logs = attendance?.dailyLogs?.filter(log => log.date === reportDate) || [];
      const isPresent = logs.some(log => log.status === "present");
      return { student, isPresent };
    });

    // Sort by Branch > Roll No
    const sortedData = [...completeData].sort((a, b) => {
      const branchA = (a.student.branch || "UNKNOWN").trim().toUpperCase();
      const branchB = (b.student.branch || "UNKNOWN").trim().toUpperCase();

      if (branchA === branchB) {
        return a.student.rollno.localeCompare(b.student.rollno);
      }
      return branchA.localeCompare(branchB);
    });

    // Create PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers
    const fileName = `${shortBatchName}_${displayDate}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`
    );
  
    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to add headers
    const addHeaders = (doc, title) => {
      let yPos = 50; // Always start from top margin
      
      // Header 1: Institute name
      doc.rect(50, yPos, 495, 35)
         .fillAndStroke('#1f4e79', '#000000')
         .fillColor('#ffffff')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Institute of Aeronautical Engineering', 50, yPos + 12, { 
           width: 495, 
           align: 'center' 
         });
      
      yPos += 35;
      
      // Header 2: PAT Attendance Summary
      doc.rect(50, yPos, 495, 30)
         .fillAndStroke('#2e75b6', '#000000')
         .fillColor('#ffffff')
         .fontSize(14)
         .text(`PAT Attendance Summary - ${displayDate}`, 50, yPos + 10, { 
           width: 495, 
           align: 'center' 
         });
      
      yPos += 30;
      
      // Header 3: Career Development Center
      doc.rect(50, yPos, 495, 25)
         .fillAndStroke('#3d85c6', '#000000')
         .fillColor('#ffffff')
         .fontSize(12)
         .text('Career Development Center', 50, yPos + 8, { 
           width: 495, 
           align: 'center' 
         });
      
      yPos += 25;
      
      // Header 4: Title
      doc.rect(50, yPos, 495, 25)
         .fillAndStroke('#4a90e2', '#000000')
         .fillColor('#ffffff')
         .fontSize(11)
         .text(title, 50, yPos + 8, { 
           width: 495, 
           align: 'center' 
         });
      
      return yPos + 35; // Return next Y position
    };

    // Helper function to create table with proper page management
    const createTable = (doc, data, startY, showSummary = false, summaryType = 'complete') => {
      let yPos = startY;
      const headerHeight = 25;
      const rowHeight = 20;
      const colWidths = [40, 70, 180, 80, 80, 45]; // S.No, Roll No, Name, Branch, Batch, Status
      const pageBottom = 750; // Bottom margin for page break
      
      // Function to add table header
      const addTableHeader = (yPosition) => {
        let xPos = 50;
        
        // Draw header background
        doc.rect(50, yPosition, 495, headerHeight)
           .fillAndStroke('#34495e', '#000000')
           .fillColor('#ffffff')
           .fontSize(10)
           .font('Helvetica-Bold');
        
        // Header text
        const headers = ['S.No', 'Roll No', 'Name', 'Branch', 'Batch', 'Status'];
        headers.forEach((header, i) => {
          doc.text(header, xPos + 5, yPosition + 8, { 
            width: colWidths[i] - 10, 
            align: 'center' 
          });
          xPos += colWidths[i];
        });
        
        return yPosition + headerHeight;
      };
      
      // Add initial table header
      yPos = addTableHeader(yPos);
      
      // Table rows
      data.forEach((item, index) => {
        // Check if we need a new page
        if (yPos + rowHeight > pageBottom) {
          doc.addPage();
          yPos = addTableHeader(50); // Add header at top of new page
        }
        
        let xPos = 50;
        
        // Alternating row colors
        const fillColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(50, yPos, 495, rowHeight).fillAndStroke(fillColor, '#cccccc');
        
        // Row data
        const rowData = [
          (index + 1).toString(),
          item.student.rollno,
          item.student.name,
          item.student.branch || "UNKNOWN",
          getShortBatchName(item.student.batch),
          item.isPresent ? "Present" : "Absent"
        ];
        
        rowData.forEach((cell, i) => {
          // Special styling for status column
          if (i === 5) {
            const statusColor = item.isPresent ? '#d4f3d0' : '#ffebee';
            const textColor = item.isPresent ? '#2e7d32' : '#c62828';
            
            doc.rect(xPos, yPos, colWidths[i], rowHeight)
               .fillAndStroke(statusColor, '#cccccc')
               .fillColor(textColor)
               .fontSize(9)
               .font('Helvetica-Bold');
          } else {
            doc.fillColor('#000000')
               .fontSize(9)
               .font('Helvetica');
          }
          
          const align = i === 2 ? 'left' : 'center'; // Left align names
          doc.text(cell, xPos + 5, yPos + 6, { 
            width: colWidths[i] - 10, 
            align: align 
          });
          
          xPos += colWidths[i];
        });
        
        yPos += rowHeight;
      });
      
      // Add summary
      if (showSummary) {
        // Check if we need space for summary
        if (yPos + 65 > pageBottom) {
          doc.addPage();
          yPos = 50;
        }
        
        yPos += 20;
        const present = data.filter(item => item.isPresent).length;
        const absent = data.filter(item => !item.isPresent).length;
        
        if (summaryType === 'branch') {
          // Branch-wise summary header
          doc.rect(50, yPos, 495, 25)
             .fillAndStroke('#3498db', '#000000')
             .fillColor('#ffffff')
             .fontSize(12)
             .font('Helvetica-Bold')
             .text('SUMMARY', 50, yPos + 8, { 
               width: 495, 
               align: 'center' 
             });
          
          yPos += 25;
          
          // Summary data - Only show absent count for branch-specific sheets
          doc.rect(50, yPos, 495, 20)
             .fillAndStroke('#e74c3c', '#000000')
             .fillColor('#ffffff')
             .fontSize(10)
             .text(`Absent: ${absent}`, 50, yPos + 6, { 
               width: 495, 
               align: 'center' 
             });
             
        } else {
          // Complete report summary
          doc.rect(50, yPos, 495, 25)
             .fillAndStroke('#3498db', '#000000')
             .fillColor('#ffffff')
             .fontSize(12)
             .font('Helvetica-Bold')
             .text('TOTAL SUMMARY', 50, yPos + 8, { 
               width: 495, 
               align: 'center' 
             });
          
          yPos += 25;
          
          // Three columns for complete summary
          doc.rect(50, yPos, 165, 20)
             .fillAndStroke('#3498db', '#000000')
             .fillColor('#ffffff')
             .fontSize(10)
             .text(`TOTAL: ${data.length}`, 50, yPos + 6, { 
               width: 165, 
               align: 'center' 
             });
          
          doc.rect(215, yPos, 165, 20)
             .fillAndStroke('#27ae60', '#000000')
             .fillColor('#ffffff')
             .text(`Present: ${present}`, 215, yPos + 6, { 
               width: 165, 
               align: 'center' 
             });
          
          doc.rect(380, yPos, 165, 20)
             .fillAndStroke('#e74c3c', '#000000')
             .fillColor('#ffffff')
             .text(`Absent: ${absent}`, 380, yPos + 6, { 
               width: 165, 
               align: 'center' 
             });
        }
      }
      
      return yPos;
    };

    // Generate Complete Report
    let currentY = addHeaders(doc, `B.Tech V Semester - ${shortBatchName}(Both Present & Absent)`);
    createTable(doc, sortedData, currentY, true, 'complete');

    // Generate Branch-wise Absentee Reports
    const branchMap = {};
    for (const entry of completeData) {
      const branch = (entry.student.branch || "UNKNOWN").trim().toUpperCase();
      if (!branchMap[branch]) branchMap[branch] = [];
      branchMap[branch].push(entry);
    }

    // Get branches with absentees only
    const branchesWithAbsentees = Object.keys(branchMap)
      .filter(branch => branchMap[branch].some(entry => !entry.isPresent))
      .sort();

    console.log(`Generating reports for ${branchesWithAbsentees.length} branches with absentees`);

    for (const branch of branchesWithAbsentees) {
      const absentees = branchMap[branch].filter(entry => !entry.isPresent);
      
      if (absentees.length === 0) continue;

      console.log(`Processing branch ${branch} with ${absentees.length} absentees`);

      // Sort absentees by roll number
      const sortedAbsentees = absentees.sort((a, b) => {
        return a.student.rollno.localeCompare(b.student.rollno);
      });

      // Add new page for each branch
      doc.addPage();
      const title = `B.Tech V Semester - ${shortBatchName}_${branch}(Absent Only)`;
      currentY = addHeaders(doc, title);
      createTable(doc, sortedAbsentees, currentY, true, 'branch');
    }

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error("Error generating PDF report:", err);
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
  HandleAttendanceReport,
  HandleAttendanceReportExcel
}