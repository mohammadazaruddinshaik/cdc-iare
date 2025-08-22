const Coder=require('../models/coding');
const Student = require('../models/student');
const Faculty = require('../models/faculty');
const Admin = require('../models/admin');
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const getAttendanceModel = require('./GetAttendanceModel');
const attendanceSchema = require('../models/attendance.model');


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

async function HandleBatchAttendanceReportPDF(req, res) {
  try {
    const { batch, date } = req.query;
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
        title: "Absenties Report",
        absentSummary: absentSummary
      });
    }

    // --- Section 3: Present Only List ---
    if (presentStudents.length > 0) {
      doc.addPage();
      const presentSummary = `Total Present: ${presentStudents.length}`;
      drawTable(doc, presentStudents, {
        title: "Presenties Report",
        presentSummary: presentSummary
      });
    }

    doc.end();
  } catch (err) {
    console.error("Error generating attendance PDF:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function HandleBatchAttendanceReportExcel(req, res) {
  try {
    const { batch, date } = req.query;
    if (!batch || !date) {
      return res.status(400).json({ message: "Missing batch or date parameter" });
    }

    const reportDate = date;
    const displayDate = new Date(date).toLocaleDateString("en-GB").split("/").join("-");

    const Attendance = getAttendanceModel(batch);
    const attendanceRecords = await Attendance.find({});

    // **FIXED: Correctly determine the full batch name from the requested batch**
    let batchName = "UNKNOWN BATCH";
    if (attendanceRecords.length > 0 && attendanceRecords[0].rollno) {
      // Find a sample student from the attendance records to get the full batch name
      const sampleStudent = await Student.findOne({ rollno: attendanceRecords[0].rollno });
      if (sampleStudent) {
        batchName = sampleStudent.batch;
      }
    } else {
      // Fallback if no attendance records exist for that day yet
      // We find a student whose batch name contains the requested batch identifier (e.g., "2021-2025")
      const studentInBatch = await Student.findOne({ batch: new RegExp(batch, "i") });
      if (studentInBatch) {
        batchName = studentInBatch.batch;
      } else {
        return res.status(404).json({ message: `No students or attendance data could be linked to the batch identifier: ${batch}` });
      }
    }
    
    const shortBatchName = getShortBatchName(batchName);
    const students = await Student.find({ batch: batchName }).sort({ branch: 1, rollno: 1 });

    const allStudentData = students.map((student) => {
      const attendance = attendanceRecords.find((a) => a.rollno === student.rollno);
      const isPresent = attendance?.dailyLogs?.some(
        (log) => log.date === reportDate && log.status === "present"
      ) || false;

      return {
        rollno: student.rollno,
        name: student.name || "UNKNOWN NAME",
        branch: student.branch || "UNKNOWN",
        status: isPresent ? "Present" : "Absent",
      };
    });

    const absentStudents = allStudentData.filter((s) => s.status === "Absent");
    const presentStudents = allStudentData.filter((s) => s.status === "Present");

    const workbook = new ExcelJS.Workbook();
    const filename = `${shortBatchName}_${displayDate}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const createWorksheet = (sheetName, data, title, summary = {}) => {
      const sheet = workbook.addWorksheet(sheetName);
      const columns = [
        { header: "S.No", key: "sno", width: 8 },
        { header: "Roll No", key: "rollno", width: 18 },
        { header: "Name", key: "name", width: 35 },
        { header: "Branch", key: "branch", width: 15 },
        { header: "Status", key: "status", width: 12 },
      ];
      sheet.columns = columns;
      const numColumns = columns.length;
      let currentRow = 1;

      // Main Document Header
      sheet.mergeCells(currentRow, 1, currentRow, numColumns);
      const mainHeader = sheet.getCell(currentRow, 1);
      mainHeader.value = "Institute of Aeronautical Engineering";
      mainHeader.font = { bold: true, size: 16 };
      mainHeader.alignment = { horizontal: 'center' };
      currentRow++;

      sheet.mergeCells(currentRow, 1, currentRow, numColumns);
      const subHeader = sheet.getCell(currentRow, 1);
      subHeader.value = "Career Development Center";
      subHeader.font = { size: 12 };
      subHeader.alignment = { horizontal: 'center' };
      currentRow++;

      sheet.mergeCells(currentRow, 1, currentRow, numColumns);
      const dateHeader = sheet.getCell(currentRow, 1);
      dateHeader.value = `PAT Attendance Summary - Date: ${displayDate}`;
      dateHeader.font = { bold: true, size: 14 };
      dateHeader.alignment = { horizontal: 'center' };
      currentRow += 2; // Add a space

      // Section Title
      sheet.mergeCells(currentRow, 1, currentRow, numColumns);
      const sectionTitle = sheet.getCell(currentRow, 1);
      sectionTitle.value = title;
      sectionTitle.font = { bold: true, size: 14 };
      sectionTitle.alignment = { horizontal: 'center' };
      currentRow++;

      // Summary Section
      if (summary.total) { 
        sheet.mergeCells(currentRow, 1, currentRow, 2);
        const totalCell = sheet.getCell(currentRow, 1);
        totalCell.value = summary.total;
        totalCell.font = { bold: true, size: 11 };
        totalCell.alignment = { horizontal: 'left' };
        
        sheet.mergeCells(currentRow, 3, currentRow, 3);
        const presentCell = sheet.getCell(currentRow, 3);
        presentCell.value = summary.present;
        presentCell.font = { bold: true, size: 11, color: { argb: "FF2E7D32" } };
        presentCell.alignment = { horizontal: 'center' };

        sheet.mergeCells(currentRow, 4, currentRow, 5);
        const absentCell = sheet.getCell(currentRow, 4);
        absentCell.value = summary.absent;
        absentCell.font = { bold: true, size: 11, color: { argb: "FFC62828" } };
        absentCell.alignment = { horizontal: 'right' };
      } else if (summary.single) { 
        sheet.mergeCells(currentRow, 1, currentRow, numColumns);
        const singleSummaryCell = sheet.getCell(currentRow, 1);
        singleSummaryCell.value = summary.single;
        singleSummaryCell.font = { bold: true, size: 11 };
        singleSummaryCell.alignment = { horizontal: 'center' };
      }
      currentRow += 2; 

      // Table Headers
      const headerRow = sheet.getRow(currentRow);
      headerRow.height = 20;
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      
      // **FIXED: Explicitly set the header cell values**
      headerRow.values = columns.map(c => c.header);
      
      headerRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF34495E" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      // Table Data
      data.forEach((item, idx) => {
        const row = sheet.addRow({
          sno: idx + 1,
          ...item
        });

        const rowBgColor = (idx % 2 === 0) ? "FFF5F5F5" : "FFFFFFFF";

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', horizontal: sheet.getColumn(colNumber).key === 'name' ? 'left' : 'center' };
          cell.font = { size: 10 };
        });

        const statusCell = row.getCell('status');
        if (item.status === 'Present') {
          statusCell.font = { bold: true, color: { argb: 'FF2E7D32' }, size: 10 };
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4EA' } };
        } else if (item.status === 'Absent') {
          statusCell.font = { bold: true, color: { argb: 'FFC62828' }, size: 10 };
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
        }
      });
    };

    // --- Create all necessary worksheets ---

    createWorksheet(
      "Complete Report",
      allStudentData,
      "Complete Attendance Report", {
        total: `Total Students: ${allStudentData.length}`,
        present: `Present: ${presentStudents.length}`,
        absent: `Absent: ${absentStudents.length}`
      }
    );

    if (absentStudents.length > 0) {
      createWorksheet(
        "Absent Students",
        absentStudents,
        "Absenties Report", {
          single: `Total Absentees: ${absentStudents.length}`
        }
      );
    }

    if (presentStudents.length > 0) {
      createWorksheet(
        "Present Students",
        presentStudents,
        "Present Only Report", {
          single: `Total Present: ${presentStudents.length}`
        }
      );
    }

    const groupedByBranch = allStudentData.reduce((acc, student) => {
      acc[student.branch] = acc[student.branch] || [];
      acc[student.branch].push(student);
      return acc;
    }, {});

    for (const branch in groupedByBranch) {
      const branchData = groupedByBranch[branch];
      const branchPresent = branchData.filter(s => s.status === 'Present').length;
      const branchAbsent = branchData.length - branchPresent;

      createWorksheet(
        `${branch} Report`,
        branchData,
        `${branch} Attendance Report`, {
          total: `Total: ${branchData.length}`,
          present: `Present: ${branchPresent}`,
          absent: `Absent: ${branchAbsent}`
        }
      );
    }

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error generating attendance Excel:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports={
    getLeaderBoardData,
    HandleChangePassword,
    HandleResetPassword,
    getViewStudentData,
    HandleBatchAttendanceReportPDF,
    HandleBatchAttendanceReportExcel
}