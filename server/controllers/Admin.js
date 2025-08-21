const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const Student = require("../models/student");
const getAttendanceModel = require("../services/GetAttendanceModel");
const Faculty = require("../models/faculty");
const Admin = require("../models/admin")
const ExcelJS = require("exceljs");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Announcement = require("../models/Announcement");
const mongoose = require('mongoose');

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
        "Absent Only Report", {
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

async function HandleSessionAttendanceReportExcel(req, res) {
  const { batch, date, format = "excel" } = req.query;

  if (!batch || !date || format !== "excel") {
    return res.status(400).json({
      message: "batch, date, and format=excel are required",
    });
  }

  const batches = Array.isArray(batch) ? batch : [batch];
  const allSummaries = [];

  try {
    for (const b of batches) {
      const collectionName = `attendance_${b
        .toLowerCase()
        .replace(/batch/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")}`;

      const Attendance = getAttendanceModel(collectionName);
      const students = await Attendance.find();

      const branchData = {};

      for (const student of students) {
        const branch = student.branch || "UNKNOWN";
        const shortBatch = getShortBatchName(student.batch);

        if (!branchData[branch]) {
          branchData[branch] = {
            batch: shortBatch,
            branch,
            strength: 0,
            presenties: 0,
            absenties: 0,
          };
        }

        const logsForDate = student.dailyLogs?.filter(
          (log) => log.date === date
        );

        const wasPresent = logsForDate?.some(
          (log) => log.status.toLowerCase() === "present"
        );

        branchData[branch].strength++;
        if (wasPresent) {
          branchData[branch].presenties++;
        } else {
          branchData[branch].absenties++;
        }
      }

      allSummaries.push(...Object.values(branchData));
    }

    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PAT Attendance Summary");

    const formatDateForDisplay = (dateString) => {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const displayDate = formatDateForDisplay(date);

    const headerRows = [
      ["Institute of Aeronautical Engineering", "1f4e79", 16, "FFFFFF"],
      [`PAT Attendance Summary - ${displayDate}`, "2e75b6", 14, "FFFFFF"],
      ["Career Development Center", "3d85c6", 12, "FFFFFF"],
      ["B.Tech V Semester Attendance Summary", "4a90e2", 11, "FFFFFF"],
    ];

    headerRows.forEach(([text, bgColor, fontSize, textColor], i) => {
      const row = sheet.addRow([text, "", "", "", ""]);
      sheet.mergeCells(`A${i + 1}:E${i + 1}`);
      row.getCell(1).font = {
        bold: true,
        size: fontSize,
        color: { argb: textColor },
        name: "Calibri",
      };
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      row.height = fontSize + 8;
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border = {
          top: { style: "medium", color: { argb: "000000" } },
          left: { style: "medium", color: { argb: "000000" } },
          bottom: { style: "medium", color: { argb: "000000" } },
          right: { style: "medium", color: { argb: "000000" } },
        };
      });
    });

    sheet.addRow(["", "", "", "", ""]);

    const headerRow = sheet.addRow(["BATCH", "BRANCH", "Total Strength", "Present", "Absent"]);
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "34495e" } };
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" }, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "medium", color: { argb: "000000" } },
        left: { style: "medium", color: { argb: "000000" } },
        bottom: { style: "medium", color: { argb: "000000" } },
        right: { style: "medium", color: { argb: "000000" } },
      };
    });

    sheet.columns = [
      { width: 25 },
      { width: 25 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    const batchGroups = {};
    allSummaries.forEach(item => {
      if (!batchGroups[item.batch]) batchGroups[item.batch] = [];
      batchGroups[item.batch].push(item);
    });

    let totalPresent = 0;
    let totalAbsent = 0;

    Object.entries(batchGroups).forEach(([batchName, rows]) => {
      const groupStartRow = sheet.lastRow.number + 1;

      rows.forEach((item, index) => {
        // Only show batch name in first row of each group
        const batchCellValue = index === 0 ? batchName : "";
        const row = sheet.addRow([batchCellValue, item.branch, item.strength, item.presenties, item.absenties]);
        totalPresent += item.presenties;
        totalAbsent += item.absenties;
        row.height = 22;

        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Calibri", size: 11 };
          cell.alignment = { vertical: "middle", horizontal: colNumber === 2 ? "left" : "center" };
          cell.border = {
            top: { style: "thin", color: { argb: "CCCCCC" } },
            left: { style: "thin", color: { argb: "CCCCCC" } },
            bottom: { style: "thin", color: { argb: "CCCCCC" } },
            right: { style: "thin", color: { argb: "CCCCCC" } },
          };

          if (colNumber === 4) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D4F3D0" } };
            cell.font = { ...cell.font, color: { argb: "2E7D32" }, bold: true };
          } else if (colNumber === 5) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEBEE" } };
            cell.font = { ...cell.font, color: { argb: "C62828" }, bold: true };
          } else {
            const bgColor = (sheet.lastRow.number - groupStartRow) % 2 === 0 ? "F8F9FA" : "FFFFFF";
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          }
        });
      });

      // Merge cells in first column if there are multiple rows for same batch
      const groupEndRow = sheet.lastRow.number;
      if (rows.length > 1) {
        sheet.mergeCells(`A${groupStartRow}:A${groupEndRow}`);
        const mergedCell = sheet.getCell(`A${groupStartRow}`);
        mergedCell.alignment = { vertical: "middle", horizontal: "center" };
      }
    });

    sheet.addRow(["", "", "", "", ""]);
    const summaryHeaderRow = sheet.addRow(["", "SUMMARY", "", "", ""]);
    sheet.mergeCells(`B${summaryHeaderRow.number}:E${summaryHeaderRow.number}`);
    summaryHeaderRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "3498DB" } };
    summaryHeaderRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FFFFFF" }, name: "Calibri" };
    summaryHeaderRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };

    const totalRow = sheet.addRow([
      "TOTAL",
      `Total Students: ${totalPresent + totalAbsent}`,
      totalPresent + totalAbsent,
      totalPresent,
      totalAbsent,
    ]);

    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFF" }, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };

      const colors = ["34495e", "3498DB", "9B59B6", "27AE60", "E74C3C"];
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors[colNumber - 1] } };
      cell.border = {
        top: { style: "medium", color: { argb: "000000" } },
        left: { style: "medium", color: { argb: "000000" } },
        bottom: { style: "medium", color: { argb: "000000" } },
        right: { style: "medium", color: { argb: "000000" } },
      };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_summary_${displayDate.replace(/-/g, "_")}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function HandleSessionAttendanceReportPDF(req, res) {
  const { batch, date } = req.query;

  if (!batch || !date) {
    return res.status(400).json({
      message: "batch and date are required",
    });
  }

  const batches = Array.isArray(batch) ? batch : [batch];
  const allSummaries = [];

  try {
    for (const b of batches) {
      const collectionName = `attendance_${b
        .toLowerCase()
        .replace(/batch/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")}`;

      const Attendance = getAttendanceModel(collectionName);
      const students = await Attendance.find();

      const branchData = {};

      for (const student of students) {
        const branch = student.branch || "UNKNOWN";
        const shortBatch = getShortBatchName(student.batch);

        if (!branchData[branch]) {
          branchData[branch] = {
            batch: shortBatch,
            branch,
            strength: 0,
            presenties: 0,
            absenties: 0,
          };
        }

        const logsForDate = student.dailyLogs?.filter(
          (log) => log.date === date
        );

        const wasPresent = logsForDate?.some(
          (log) => log.status.toLowerCase() === "present"
        );

        branchData[branch].strength++;
        if (wasPresent) {
          branchData[branch].presenties++;
        } else {
          branchData[branch].absenties++;
        }
      }

      allSummaries.push(...Object.values(branchData));
    }

    // Format date
    const formatDateForDisplay = (dateString) => {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;

      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const displayDate = formatDateForDisplay(date);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      layout: "portrait",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_summary_${displayDate.replace(/-/g, "_")}.pdf`
    );

    doc.pipe(res);

    const colors = {
      darkBlue: "#1f4e79",
      mediumBlue: "#2e75b6",
      lightBlue: "#3d85c6",
      lighterBlue: "#4a90e2",
      darkGray: "#34495e",
      lightGray: "#f8f9fa",
      green: "#27ae60",
      red: "#e74c3c",
      lightGreen: "#d4f3d0",
      lightRed: "#ffebee",
      white: "#ffffff",
      black: "#000000",
    };

    const addColoredRect = (x, y, width, height, color) => {
      doc.rect(x, y, width, height).fill(color);
    };

    const addSimpleText = (text, x, y, width, height, bgColor, textColor, fontSize = 11, align = "center") => {
      // Draw background
      doc.rect(x, y, width, height).fill(bgColor);

      // Draw border
      doc.rect(x, y, width, height).stroke("#cccccc");

      // Add text
      doc
        .fillColor(textColor)
        .fontSize(fontSize)
        .font("Helvetica");

      const padding = align === "center" ? 0 : 5;
      const textWidth = width - (padding * 2);

      doc.text(
        text,
        x + padding,
        y + (height - fontSize) / 2,
        {
          width: textWidth,
          align: align,
        }
      );
    };

    const addTextWithBackground = (
      text,
      x,
      y,
      width,
      height,
      bgColor,
      textColor,
      fontSize = 12,
      align = "center"
    ) => {
      addColoredRect(x, y, width, height, bgColor);
      doc.rect(x, y, width, height).stroke("#000000");
      doc
        .fillColor(textColor)
        .fontSize(fontSize)
        .font("Helvetica-Bold");
      if (align === "center") {
        doc.text(text, x, y + (height - fontSize) / 2, {
          width: width,
          align: "center",
        });
      } else {
        doc.text(text, x + 5, y + (height - fontSize) / 2, {
          width: width - 10,
          align: align,
        });
      }
    };

    const pageWidth = doc.page.width - 100;
    const rowHeight = 25;
    let currentY = 50;

    const drawHeaders = () => {
      const headerSections = [
        {
          text: "Institute of Aeronautical Engineering",
          color: colors.darkBlue,
          fontSize: 16,
        },
        {
          text: `PAT Attendance Summary - ${displayDate}`,
          color: colors.mediumBlue,
          fontSize: 14,
        },
        {
          text: "Career Development Center",
          color: colors.lightBlue,
          fontSize: 12,
        },
        {
          text: "B.Tech V Semester Attendance Summary",
          color: colors.lighterBlue,
          fontSize: 11,
        },
      ];

      headerSections.forEach((section) => {
        const headerHeight = section.fontSize + 8;
        addTextWithBackground(
          section.text,
          50,
          currentY,
          pageWidth,
          headerHeight,
          section.color,
          colors.white,
          section.fontSize,
          "center"
        );
        currentY += headerHeight;
      });

      currentY += 20;
    };

    const drawTableHeader = () => {
      const headers = [
        "BATCH",
        "BRANCH",
        "Total Strength",
        "Present",
        "Absent",
      ];
      const colWidths = [
        pageWidth * 0.2,
        pageWidth * 0.25,
        pageWidth * 0.2,
        pageWidth * 0.175,
        pageWidth * 0.175,
      ];

      let tableX = 50;
      headers.forEach((header, index) => {
        addTextWithBackground(
          header,
          tableX,
          currentY,
          colWidths[index],
          rowHeight,
          colors.darkGray,
          colors.white,
          12,
          "center"
        );
        tableX += colWidths[index];
      });
      currentY += rowHeight;

      return colWidths;
    };

    drawHeaders();
    const colWidths = drawTableHeader();

    let totalPresent = 0;
    let totalAbsent = 0;

    // Sort summaries by batch name for consistent ordering
    allSummaries.sort((a, b) => {
      if (a.batch === b.batch) {
        return a.branch.localeCompare(b.branch);
      }
      return a.batch.localeCompare(b.batch);
    });

    let rowIndex = 0;

    // Flatten the data and show batch name in every row (simpler approach)
    allSummaries.forEach((item) => {
      totalPresent += item.presenties;
      totalAbsent += item.absenties;

      // Check if we need a new page
      if (currentY + rowHeight > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
        drawHeaders();
        drawTableHeader();
      }

      const isEvenRow = rowIndex % 2 === 0;
      const rowBgColor = isEvenRow ? colors.lightGray : colors.white;

      // Always show batch name in every row (no grouping complexity)
      const rowData = [
        item.batch,
        item.branch,
        item.strength.toString(),
        item.presenties.toString(),
        item.absenties.toString(),
      ];

      let tableX = 50;

      rowData.forEach((data, colIndex) => {
        let bgColor = rowBgColor;
        let textColor = colors.black;

        // Apply special colors for present/absent columns
        if (colIndex === 3) {
          bgColor = colors.lightGreen;
          textColor = "#2e7d32";
        } else if (colIndex === 4) {
          bgColor = colors.lightRed;
          textColor = "#c62828";
        }

        // Draw background rectangle
        doc.rect(tableX, currentY, colWidths[colIndex], rowHeight).fill(bgColor);

        // Draw border (stroke only, no fill)
        doc.rect(tableX, currentY, colWidths[colIndex], rowHeight).stroke("#cccccc");

        // Add text
        doc
          .fillColor(textColor)
          .fontSize(11)
          .font(colIndex >= 3 ? "Helvetica-Bold" : "Helvetica");

        const textAlign = colIndex === 1 ? "left" : "center";
        const padding = textAlign === "center" ? 0 : 5;
        const textWidth = colWidths[colIndex] - (padding * 2);

        doc.text(
          data,
          tableX + padding,
          currentY + (rowHeight - 11) / 2,
          {
            width: textWidth,
            align: textAlign,
          }
        );

        tableX += colWidths[colIndex];
      });

      currentY += rowHeight;
      rowIndex++;
    });

    // Summary section
    if (currentY + rowHeight * 2 > doc.page.height - 100) {
      doc.addPage();
      currentY = 50;
      drawHeaders();
    }

    currentY += 20;

    // Draw summary header
    addTextWithBackground(
      "SUMMARY",
      50,
      currentY,
      pageWidth,
      rowHeight,
      colors.mediumBlue,
      colors.white,
      12,
      "center"
    );
    currentY += rowHeight;

    // Draw summary data
    const summaryData = [
      {
        text: "TOTAL",
        color: colors.darkGray,
        width: pageWidth * 0.2,
      },
      {
        text: `Total Students: ${totalPresent + totalAbsent}`,
        color: colors.mediumBlue,
        width: pageWidth * 0.35,
      },
      {
        text: (totalPresent + totalAbsent).toString(),
        color: "#9b59b6",
        width: pageWidth * 0.15,
      },
      {
        text: totalPresent.toString(),
        color: colors.green,
        width: pageWidth * 0.15,
      },
      {
        text: totalAbsent.toString(),
        color: colors.red,
        width: pageWidth * 0.15,
      },
    ];

    let summaryX = 50;
    summaryData.forEach((item) => {
      addTextWithBackground(
        item.text,
        summaryX,
        currentY,
        item.width,
        rowHeight,
        item.color,
        colors.white,
        11,
        "center"
      );
      summaryX += item.width;
    });

    doc.end();
  } catch (err) {
    console.error("Error generating PDF report:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

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


//--------- Attendace Monthly Report Analysis Code Start -------------------------------//

// =========================================================================
// CONSTANTS & STYLES
// =========================================================================
const dayjs = require("dayjs");
const COLLECTION_PREFIX = "attendance_"; // e.g., attendance_skillup-1

const COLORS = {
  primary: "FF2C3E50",     // Dark blue-gray
  secondary: "FF34495E",   // Slightly lighter blue-gray
  white: "FFFFFFFF",
  lightGray: "FFF8F9FA",
  excellent: "FF27AE60",   // Green (>75%)
  good: "FFF39C12",        // Orange (65-75%)
  poor: "FFE74C3C",        // Red (<65%)
  excellentBg: "FFD5F4E6", // Light green
  goodBg: "FFFEF9E7",      // Light orange
  poorBg: "FFFDEAEA",      // Light red
  present: "FF27AE60",     // Green
  absent: "FFE74C3C",       // Red
  border: "FFD5DBDB"
};

const styles = {
  titleStyle: {
    font: { bold: true, size: 18, color: { argb: COLORS.white }, name: "Arial" },
    alignment: { vertical: "middle", horizontal: "center" },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.primary } },
    border: {
      top: { style: "medium", color: { argb: COLORS.primary } },
      left: { style: "medium", color: { argb: COLORS.primary } },
      bottom: { style: "medium", color: { argb: COLORS.primary } },
      right: { style: "medium", color: { argb: COLORS.primary } }
    }
  },
  headerStyle: {
    font: { bold: true, size: 11, color: { argb: COLORS.white }, name: "Arial" },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.secondary } },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  },
  dataCell: {
    font: { size: 10, name: "Arial", color: { argb: COLORS.primary } },
    alignment: { vertical: "middle", horizontal: "left", indent: 1 },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  },
  numericCell: {
    font: { size: 10, name: "Arial", color: { argb: COLORS.primary } },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  },
  presentCell: {
    font: { bold: true, size: 10, color: { argb: COLORS.present }, name: "Arial" },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  },
  absentCell: {
    font: { bold: true, size: 10, color: { argb: COLORS.absent }, name: "Arial" },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  },
  holidayCell: {
    font: { bold: true, size: 50, color: { argb: COLORS.white }, name: "Arial" },
    alignment: { vertical: "middle", horizontal: "center", textRotation: 90 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.absent } },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  }
};

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function toISO(s) {
  return dayjs(s, ["YYYY-MM-DD", "YYYY/MM/DD"]).format("YYYY-MM-DD");
}

function getPercentageStyle(percentage) {
  const baseStyle = {
    font: { size: 10, bold: true, name: "Arial" },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      top: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } }
    }
  };

  if (percentage > 75) {
    return { ...baseStyle, font: { ...baseStyle.font, color: { argb: COLORS.excellent } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.excellentBg } } };
  } else if (percentage >= 65) {
    return { ...baseStyle, font: { ...baseStyle.font, color: { argb: COLORS.good } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.goodBg } } };
  } else {
    return { ...baseStyle, font: { ...baseStyle.font, color: { argb: COLORS.poor } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.poorBg } } };
  }
}

function buildDateRange(from, to) {
  const days = [];
  let cursor = dayjs(from);
  const end = dayjs(to);
  while (cursor.isSame(end) || cursor.isBefore(end)) {
    days.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(1, "day");
  }
  return days;
}

async function getAllCourses(collectionName) {
  const Attendance = getAttendanceModel(collectionName);
  const docs = await Attendance.find({}).lean();
  const coursesSet = new Set();
  docs.forEach(doc => { (doc.dailyLogs || []).forEach(log => { if (log.course) { coursesSet.add(log.course); } }); });
  return Array.from(coursesSet).sort();
}

function summarizeStudent(doc, dates, allCourses) {
  const logsInRange = (doc.dailyLogs || []).filter((x) => dates.has(x.date));
  const totalDays = logsInRange.length;
  const presentDays = logsInRange.reduce((acc, x) => acc + (x.status === "present" ? 1 : 0), 0);
  const perCourse = {};
  for (const course of allCourses) { perCourse[course] = { present: 0, total: 0 }; }
  for (const lg of logsInRange) {
    if (!lg.course) continue;
    if (perCourse[lg.course]) {
      perCourse[lg.course].total += 1;
      if (lg.status === "present") perCourse[lg.course].present += 1;
    }
  }
  const calendarMap = {};
  for (const d of dates) calendarMap[d] = "H";
  for (const lg of logsInRange) { calendarMap[lg.date] = lg.status === "present" ? "P" : "A"; }
  return { totalDays, presentDays, perCourse, calendarMap };
}

function findCommonHolidays(docs, dates, allCourses) {
    const holidayDates = [];
    const dateArray = Array.from(dates);

    for (const date of dateArray) {
        let isCommonHoliday = true;
        if (docs.length === 0) {
            isCommonHoliday = false;
        } else {
            for (const doc of docs) {
                const { calendarMap } = summarizeStudent(doc, dates, allCourses);
                if (calendarMap[date] !== "H") {
                    isCommonHoliday = false;
                    break;
                }
            }
        }
        if (isCommonHoliday) {
            holidayDates.push(date);
        }
    }
    return holidayDates;
}

async function listAttendanceCollections() {
  const all = await mongoose.connection.db.listCollections().toArray();
  return all.map((x) => x.name).filter((n) => n.startsWith(COLLECTION_PREFIX));
}

// =========================================================================
// EXCEL SHEET BUILDERS
// =========================================================================

async function buildSheetForCollection(workbook, collectionName, fromISO, toISO) {
  const Attendance = getAttendanceModel(collectionName);
  const allCourses = await getAllCourses(collectionName);
  const ws = workbook.addWorksheet(collectionName.replace(COLLECTION_PREFIX, "").toUpperCase());
  const dateList = buildDateRange(fromISO, toISO);
  const dateSet = new Set(dateList);

  const baseColumns = 6;
  const courseColumns = allCourses.length;
  const totalColumns = baseColumns + courseColumns + dateList.length;

  ws.views = [{ state: "frozen", xSplit: baseColumns + courseColumns, ySplit: 3, topLeftCell: `${String.fromCharCode(65 + baseColumns + courseColumns)}4` }];

  ws.mergeCells(1, 1, 1, totalColumns);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `ATTENDANCE REPORT`;
  titleCell.style = styles.titleStyle;
  ws.getRow(1).height = 35;

  ws.mergeCells(2, 1, 2, totalColumns);
  const subtitleCell = ws.getCell(2, 1);
  subtitleCell.value = `Period: ${dayjs(fromISO).format("DD MMM YYYY")} → ${dayjs(toISO).format("DD MMM YYYY")} | Batch: ${collectionName.replace(COLLECTION_PREFIX, "").toUpperCase()}`;
  subtitleCell.font = { bold: true, size: 12, color: { argb: COLORS.primary }, name: "Arial" };
  subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
  subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightGray } };
  ws.getRow(2).height = 25;

  const headerRow = ws.addRow(["S.No", "Roll No", "Name", "Branch", "Batch", "Overall (%)", ...allCourses.map(c => `${c} (%)`), ...dateList.map(d => dayjs(d).format("DD MMM"))]);
  headerRow.height = 40;
  headerRow.eachCell((cell) => { cell.style = styles.headerStyle; });

  const widths = [8, 18, 40, 18, 28, 15, ...Array(courseColumns).fill(18), ...Array(dateList.length).fill(10)];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  const docs = await Attendance.find({}).lean().sort({ rollno: 1 });
  const batchSummary = { totalStudents: 0, totalPercentage: 0 };
  const commonHolidays = findCommonHolidays(docs, dateSet, allCourses);

  const firstDataRow = 4;
  const lastDataRow = firstDataRow + docs.length - 1;

  docs.forEach((doc, index) => {
    const { totalDays, presentDays, perCourse, calendarMap } = summarizeStudent(doc, dateSet, allCourses);
    const overallPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : 0;
    batchSummary.totalStudents++;
    batchSummary.totalPercentage += overallPct;

    const coursePercentages = allCourses.map(c => {
      const data = perCourse[c];
      return !data || data.total === 0 ? "N/A" : Math.round((data.present / data.total) * 1000) / 10;
    });

    const row = ws.addRow([index + 1, doc.rollno || "N/A", doc.name || "Unknown", doc.branch || "N/A", doc.batch || "N/A", overallPct, ...coursePercentages, ...dateList.map(d => calendarMap[d] || "")]);
    row.height = 25;

    row.eachCell((cell, colNumber) => {
      if (colNumber <= baseColumns) {
        if (colNumber === 1) cell.style = styles.numericCell;
        else if (colNumber === baseColumns) {
          cell.style = getPercentageStyle(overallPct);
          cell.value = `${overallPct}%`;
        } else cell.style = styles.dataCell;
      } else if (colNumber <= baseColumns + courseColumns) {
        if (cell.value !== "N/A") {
          cell.style = getPercentageStyle(cell.value);
          cell.value = `${cell.value}%`;
        } else {
          cell.style = styles.dataCell;
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightGray } };
        }
      } else {
        const value = cell.value;
        if (value === "P") { cell.style = styles.presentCell; }
        else if (value === "A") { cell.style = styles.absentCell; }
        else if (value === "H") {
          const currentDate = dateList[colNumber - baseColumns - courseColumns - 1];
          cell.style = styles.holidayCell;
          cell.value = commonHolidays.includes(currentDate) ? "" : "HOLIDAY";
        } else {
          cell.style = styles.dataCell;
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      }
    });
  });

  for (const holiday of commonHolidays) {
    const dateIndex = dateList.indexOf(holiday);
    if (dateIndex !== -1) {
      const col = baseColumns + courseColumns + 1 + dateIndex;
      if (docs.length > 0) {
        ws.mergeCells(firstDataRow, col, lastDataRow, col);
        const mergedCell = ws.getCell(firstDataRow, col);
        mergedCell.value = "HOLIDAY";
        mergedCell.style = styles.holidayCell;
      }
    }
  }

  workbook.batchSummaries = workbook.batchSummaries || [];
  workbook.batchSummaries.push({
    batchName: collectionName.replace(COLLECTION_PREFIX, "").toUpperCase(),
    averagePercentage: batchSummary.totalStudents > 0 ? Math.round((batchSummary.totalPercentage / batchSummary.totalStudents) * 10) / 10 : 0,
    totalStudents: batchSummary.totalStudents
  });
}

function createSummarySheet(workbook, fromISO, toISO) {
  const ws = workbook.addWorksheet("SUMMARY", { properties: { tabColor: { argb: COLORS.primary } } });
  
  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = `ATTENDANCE SUMMARY REPORT`;
  ws.getCell('A1').style = styles.titleStyle;
  ws.getRow(1).height = 35;

  ws.mergeCells('A2:D2');
  ws.getCell('A2').value = `Period: ${dayjs(fromISO).format("DD MMM YYYY")} → ${dayjs(toISO).format("DD MMM YYYY")}`;
  ws.getCell('A2').font = { bold: true, size: 12, color: { argb: COLORS.primary }, name: "Arial" };
  ws.getCell('A2').alignment = { vertical: "middle", horizontal: "center" };
  ws.getCell('A2').fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightGray } };
  ws.getRow(2).height = 25;

  const headerRow = ws.addRow(["S.No", "Batch Name", "Total Students", "Average Percentage"]);
  headerRow.height = 30;
  headerRow.eachCell(cell => cell.style = styles.headerStyle);

  ws.columns = [{ width: 8 }, { width: 30 }, { width: 18 }, { width: 20 }];

  const grandTotal = { students: 0, percentage: 0 };
  (workbook.batchSummaries || []).forEach((batch, index) => {
    const row = ws.addRow([index + 1, batch.batchName, batch.totalStudents, batch.averagePercentage]);
    row.height = 25;
    row.getCell(1).style = styles.numericCell;
    row.getCell(2).style = styles.dataCell;
    row.getCell(3).style = styles.numericCell;
    row.getCell(4).style = getPercentageStyle(batch.averagePercentage);
    row.getCell(4).value = `${batch.averagePercentage}%`;
    grandTotal.students += batch.totalStudents;
    grandTotal.percentage += batch.averagePercentage;
  });

  const avgPercentage = workbook.batchSummaries.length > 0 ? Math.round((grandTotal.percentage / workbook.batchSummaries.length) * 10) / 10 : 0;
  const totalRow = ws.addRow(["", "OVERALL AVERAGE", grandTotal.students, `${avgPercentage}%`]);
  totalRow.height = 30;
  ['B', 'C', 'D'].forEach(col => {
    const cell = totalRow.getCell(col);
    cell.style = styles.dataCell; // Base style
    cell.font = { ...cell.font, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightGray } };
    if (col === 'C') cell.alignment = styles.numericCell.alignment;
    if (col === 'D') cell.style = getPercentageStyle(avgPercentage);
  });
}

// =========================================================================
// MAIN CONTROLLER
// =========================================================================

const HandleMonthlyAttendanceReportExcel = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "Missing required query parameters: from, to (YYYY-MM-DD)" });
    }

    const fromISO = toISO(from);
    const toISODate = toISO(to);
    if (!dayjs(fromISO).isValid() || !dayjs(toISODate).isValid() || dayjs(fromISO).isAfter(toISODate)) {
      return res.status(400).json({ message: "Invalid date range." });
    }

    const collections = await listAttendanceCollections();
    if (collections.length === 0) {
      return res.status(404).json({ message: "No attendance collections found." });
    }
    collections.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    const wb = new ExcelJS.Workbook();
    wb.creator = "Attendance Management System";
    wb.created = new Date();

    for (const colName of collections) {
      console.log(`Building sheet for: ${colName}`);
      await buildSheetForCollection(wb, colName, fromISO, toISODate);
    }
    
    createSummarySheet(wb, fromISO, toISODate);

    const fileName = `Attendance_Report_${dayjs(fromISO).format("DD-MMM-YYYY")}_to_${dayjs(toISODate).format("DD-MMM-YYYY")}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    
    await wb.xlsx.write(res);
    res.end();
    console.log(`✅ Successfully generated report: ${fileName}`);

  } catch (err) {
    console.error("❌ Excel generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate attendance report", error: err.message });
    }
  }
};

//--------- Attendace Monthly Excel Report Analysis Code End -------------------------------//


async function getDashboardData(req,res) {
  
  try {
    const today = new Date().toISOString().split('T')[0];

    // --- DYNAMICALLY GET COLLECTION NAMES ---
    // 1. Get info for all collections in the database.
    const collections = await mongoose.connection.db.listCollections().toArray();

    // 2. Map to their names and filter the ones that start with 'attendance'
    const batchCollectionNames = collections
      .map(collection => collection.name)
      .filter(name => name.startsWith('attendance'));
    // --- END OF DYNAMIC LOGIC ---

    // If no matching collections are found, return an empty array.
    if (batchCollectionNames.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No attendance collections found.",
            data: []
        });
    }

    const attendanceSummary = [];

    // The rest of the logic remains the same
    for (const collectionName of batchCollectionNames) {
      const AttendanceModel = getAttendanceModel(collectionName);

      const presentCount = await AttendanceModel.countDocuments({
        dailyLogs: {
          $elemMatch: {
            date: today,
            status: 'present'
          }
        }
      });
      
      attendanceSummary.push({
        batch: collectionName,
        presentCount: presentCount,
        date: today
      });
    }

    res.status(200).json({
      success: true,
      data: attendanceSummary
    });

  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance summary.'
    });
  }
};

module.exports = {
  HandleBatchAttendanceReportPDF,
  HandleBatchAttendanceReportExcel,
  HandleSessionAttendanceReportPDF,
  HandleSessionAttendanceReportExcel,
  HandleMarkAttendance,
  HandleMonthlyAttendanceReportExcel,
  getDashboardData

}