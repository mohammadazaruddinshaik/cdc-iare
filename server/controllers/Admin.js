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
const Coder = require('../models/coding');

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
          cell.value = commonHolidays.includes(currentDate) ? "" : "No Classes Sheduled";
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

async function getDashboardData(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // --- DYNAMICALLY GET COLLECTION NAMES ---
    const collections = await mongoose.connection.db.listCollections().toArray();

    const batchCollectionNames = collections
      .map(collection => collection.name)
      .filter(name => name.startsWith('attendance'));

    // ✅ If no attendance collections
    if (batchCollectionNames.length === 0) {
      // Still send student + faculty counts
      const totalStudents = await Student.countDocuments();
      const totalFaculty = await Faculty.countDocuments();

      return res.status(200).json({
        success: true,
        message: "No attendance collections found.",
        data: {
          attendanceSummary: [],
          totalStudents,
          totalFaculty
        }
      });
    }

    const attendanceSummary = [];

    // ✅ Attendance summary per batch
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
        presentCount,
        date: today
      });
    }

    // ✅ Separate counts from Student and Faculty models
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        attendanceSummary,
        totalStudents,
        totalFaculty
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data.'
    });
  }
};

//-------------------------------   Manage Faculty Routes  Start    ----------------------------//

async function addFaculty(req, res) {

  const { name, facultyid, email, designation, subjects_assigned, batches_assigned } = req.body;

  // Basic validation
  if (!name || !facultyid || !email) {
    return res.status(400).json({ message: 'Name, Faculty ID, and Email are required.' });
  }

  try {
    // Check if faculty with the same ID or email already exists
    const existingFaculty = await Faculty.findOne({ $or: [{ facultyid }, { email }] });
    if (existingFaculty) {
      return res.status(409).json({ message: 'Faculty with this ID or email already exists.' });
    }

    // Generate the default password as "facultyid@<last_two_digits_of_year>"
    // For 2025, this will be "facultyid@25"
    const yearLastTwoDigits = new Date().getFullYear().toString().slice(-2);
    const password = `${facultyid}@${yearLastTwoDigits}`;

    // Create a new faculty instance
    const newFaculty = new Faculty({
      name,
      facultyid,
      password, // The generated default password
      email,
      designation,
      subjects_assigned,
      batches_assigned,
    });

    // Save the new faculty to the database
    const savedFaculty = await newFaculty.save();

    res.status(201).json({ message: 'Faculty added successfully!', faculty: savedFaculty });
  } catch (error) {
    // Handle potential errors, like validation errors from the model
    res.status(500).json({ message: 'Error adding faculty.', error: error.message });
  }
};

async function deleteFaculty(req, res) {
  // Get the facultyid from the request body
  const { facultyid } = req.body;

  if (!facultyid) {
    return res.status(400).json({ message: 'Faculty ID is required to delete.' });
  }

  try {
    // Find the faculty by their unique facultyid and remove them
    const deletedFaculty = await Faculty.findOneAndDelete({ facultyid: facultyid });

    if (!deletedFaculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    res.status(200).json({ message: `Faculty with ID ${facultyid} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty.', error: error.message });
  }
};

async function updateFaculty(req, res) {
  // The facultyid is used to find the document, the rest are the fields to update
  const { facultyid, password, ...updateData } = req.body; // 🚫 Extract and ignore password

  if (!facultyid) {
    return res.status(400).json({ message: 'Faculty ID is required for updates.' });
  }

  try {
    // Ensure password never gets updated through this endpoint
    if (password) {
      return res.status(403).json({ message: 'Password updates are not allowed through this Updation Use Reset Password.' });
    }

    const updatedFaculty = await Faculty.findOneAndUpdate(
      { facultyid: facultyid },
      { $set: updateData }, // Only update allowed fields
      { new: true, runValidators: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    res.status(200).json({ message: 'Faculty updated successfully!', faculty: updatedFaculty });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Error updating faculty.', error: error.message });
  }
}


//-------------------------------   Manage Faculty Routes  End      ----------------------------//


//-------------------------------   Manage Student Routes  Start    ----------------------------//

async function getViewStudents(req, res) {
  try {
    // 1. Get all students
    let students = await Student.find()
      .select("rollno name batch branch -_id") // also fetch branch
      .lean();

    // 2. For each student, fetch attendance + handles
    const AllStudents = await Promise.all(
      students.map(async (student) => {
        try {
        

          // --- Coder Handles ---
          let coderData = await Coder.findOne({
            rollno: new RegExp(`^${student.rollno}$`, "i"),
          })
            .select("handles -_id")
            .lean();

          // --- Merge all ---
          return {
            ...student,
            ...(coderData || {})
          };
        } catch (err) {
          console.error(`Error fetching data for ${student.rollno}:`, err);
          return student; // fallback
        }
      })
    );

    res.json({ AllStudents });
  } catch (err) {
    console.error("Error fetching Students data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

async function addStudent(req, res) {
  const { rollno, name, branch, batch } = req.body;

  if (!rollno || !name || !branch || !batch) {
    return res.status(400).json({ message: 'Roll No, Name, Branch, and Batch are required.' });
  }

  try {
    const existingStudent = await Student.findOne({ rollno });
    if (existingStudent) {
      return res.status(409).json({ message: 'A student with this Roll No already exists.' });
    }

    const currentYear = new Date().getFullYear(); // e.g., 2025
    const defaultPassword = `pat@${currentYear}`;
    const email = `${rollno.toLowerCase()}@iare.ac.in`;

    // --- Create documents for all three collections ---
    const newStudent = new Student({ name, rollno, password: defaultPassword, branch, batch, email });
    const newCoder = new Coder({ rollno, branch, batch });

    // Get the dynamic attendance model for the student's batch
    const Editbatch = `attendance_${batch.toLowerCase()}`
    const Attendance = getAttendanceModel(Editbatch);
    const newAttendanceRecord = new Attendance({ rollno, name, branch, batch });

    // --- Save all documents ---
    const savedStudent = await newStudent.save();
    await newCoder.save();
    await newAttendanceRecord.save();

    res.status(201).json({ message: 'Student added successfully to all systems!', student: savedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error adding student.', error: error.message });
  }
};

async function deleteStudent(req, res) {
  const { rollno } = req.body;

  if (!rollno) {
    return res.status(400).json({ message: 'Roll No is required.' });
  }

  try {
    // 1. Find the student first to get their batch
    const studentToDelete = await Student.findOne({ rollno });
    if (!studentToDelete) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 2. Get the dynamic attendance model using the student's batch
    const Attendance = getAttendanceModel(studentToDelete.batch);

    // 3. Delete the student from all three collections
    await Student.deleteOne({ rollno });
    await Coder.deleteOne({ rollno });
    await Attendance.deleteOne({ rollno });

    res.status(200).json({ message: `Student ${rollno} deleted successfully from all systems.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student.', error: error.message });
  }
};

async function updateStudent(req, res) {
  // Explicitly remove password from updates
  const { rollno, password, ...updateData } = req.body;

  if (!rollno) {
    return res.status(400).json({ message: 'Roll No is required for updates.' });
  }

  try {
    // 1. Find the original student document
    const originalStudent = await Student.findOne({ rollno });
    if (!originalStudent) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    const oldBatch = originalStudent.batch;
    const newBatch = updateData.batch;

    // 🚫 Block password update attempt
    if (password) {
      return res.status(403).json({ message: 'Password updates are not allowed through this Section.' });
    }

    // 2. Update the main Student document
    const updatedStudent = await Student.findOneAndUpdate(
      { rollno },
      updateData,
      { new: true }
    );

    // 3. Prepare and apply updates for Coder and Attendance models
    const sharedUpdateData = {};
    if (updateData.name) sharedUpdateData.name = updateData.name;
    if (updateData.branch) sharedUpdateData.branch = updateData.branch;
    if (updateData.batch) sharedUpdateData.batch = updateData.batch;
    if (updateData.handles) {
      const handleUpdates = {};
      for (const [platform, username] of Object.entries(updateData.handles)) {
        handleUpdates[`handles.${platform}`] = username;
      }
      await Coder.updateOne({ rollno }, { $set: handleUpdates });
    }
    await Coder.updateOne(
      { rollno },
      { $set: { branch: updatedStudent.branch, batch: updatedStudent.batch } }
    );


    // 4. Attendance updates
    if (newBatch && newBatch !== oldBatch) {
      const OldAttendanceModel = getAttendanceModel(`attendance_${oldBatch.toLowerCase()}`);
      const NewAttendanceModel = getAttendanceModel(`attendance_${newBatch.toLowerCase()}`);

      const attendanceRecord = await OldAttendanceModel.findOne({ rollno }).lean();
      console.log("Attendance record before delete:", attendanceRecord);

      if (attendanceRecord) {
        await OldAttendanceModel.deleteOne({ rollno }); // safer, explicit delete
        delete attendanceRecord._id;
        attendanceRecord.batch = newBatch;
        if (updateData.name) attendanceRecord.name = updateData.name;
        if (updateData.branch) attendanceRecord.branch = updateData.branch;

        await NewAttendanceModel.create(attendanceRecord);
        console.log("Moved student to new batch collection:", newBatch);
      } else {
        console.log("No attendance record found for rollno", rollno, "in", oldBatch);
      }

    }

    res.status(200).json({
      message: 'Student updated successfully across all systems!',
      student: updatedStudent
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating student.',
      error: error.message
    });
  }
}


//-------------------------------   Manage Student Routes  End      ----------------------------//


//-------------------------------   Manage Attendance Routes  Start -----------------------------//

async function getStudentsForAttendanceUpdation(req, res) {
  try {
    const { batch, date, course, status } = req.query;

    // ✅ Validation
    if (!batch || !date || !course || !status) {
      return res
        .status(400)
        .json({ message: "Missing batch, date, course, or status" });
    }

    // ✅ Ensure valid status
    if (!["present", "absent"].includes(status.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Invalid status. Must be 'present' or 'absent'." });
    }

    // ✅ Get Attendance Model
    let Attendance;
    try {
      Attendance = getAttendanceModel(batch);
    } catch (err) {
      return res
        .status(404)
        .json({ message: `Batch collection not found: ${batch}` });
    }

    // ✅ Query students by status
    const students = await Attendance.find(
      {
        dailyLogs: {
          $elemMatch: {
            date: String(date),
            course: course.trim(),
            status: status.toLowerCase(),
          },
        },
      },
      { rollno: 1, _id: 0 }
    );

    const rollnos = students.map((s) => s.rollno);

    res.status(200).json({
      batch,
      date,
      course,
      status: status.toLowerCase(),
      students: rollnos
    });
  } catch (err) {
    console.error("Error fetching students by status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

async function HandleUpdateAttendance(req, res) {
  try {
    const { course, presenties, batch, date, status } = req.body;

    // ✅ Validation
    if (!course || !Array.isArray(presenties) || !batch || !date || !status) {
      return res.status(400).json({ message: "Missing course, presenties, batch, date, or status" });
    }

    if (!["present", "absent"].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status. Must be 'present' or 'absent'." });
    }

    const Attendance = getAttendanceModel(batch);
    const targetDate = date;
    const courseKey = course.trim();
    const newStatus = status.toLowerCase();

    const bulkOps = [];

    // ✅ Find logs for these rollnos on the given date + course
    const studentsWithLogs = await Attendance.find({
      rollno: { $in: presenties },
      dailyLogs: {
        $elemMatch: {
          date: targetDate,
          course: courseKey
        }
      }
    });

    console.log(`📝 Found ${studentsWithLogs.length} students with logs for ${targetDate}`);

    for (const student of studentsWithLogs) {
      const logIndex = student.dailyLogs.findIndex(
        (log) => log.date === targetDate && log.course === courseKey
      );

      if (logIndex !== -1) {
        const currentStatus = student.dailyLogs[logIndex].status;

        if (currentStatus !== newStatus) {
          const updateObj = {
            $set: {
              [`dailyLogs.${logIndex}.status`]: newStatus,
              lastUpdated: new Date()
            }
          };

          // ✅ Adjust counts accordingly
          if (newStatus === "present" && currentStatus === "absent") {
            updateObj.$inc = {
              "overallAttendance.presentDays": 1,
              [`courseAttendance.${courseKey}.presentDays`]: 1
            };
          } else if (newStatus === "absent" && currentStatus === "present") {
            updateObj.$inc = {
              "overallAttendance.presentDays": -1,
              [`courseAttendance.${courseKey}.presentDays`]: -1
            };
          }

          bulkOps.push({
            updateOne: {
              filter: {
                rollno: student.rollno,
                [`dailyLogs.${logIndex}.date`]: targetDate,
                [`dailyLogs.${logIndex}.course`]: courseKey
              },
              update: updateObj
            }
          });
        }
      }
    }

    if (bulkOps.length === 0) {
      return res.status(404).json({
        message: `No logs needed updating for ${status}`,
        updatedCount: 0
      });
    }

    const result = await Attendance.bulkWrite(bulkOps, { ordered: false });
    console.log(`📊 Bulk operation result:`, result);

    res.status(200).json({
      message: `Bulk mark ${status} operation completed`,
      updatedCount: result.modifiedCount,
    });

  } catch (err) {
    console.error("❌ Error in HandleUpdateAttendance:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//-------------------------------   Manage Attendance Routes  Start -----------------------------//

module.exports = {
  HandleSessionAttendanceReportPDF,
  HandleSessionAttendanceReportExcel,
  HandleMarkAttendance,
  HandleMonthlyAttendanceReportExcel,
  getDashboardData,
  addFaculty,
  deleteFaculty,
  updateFaculty,
  addStudent,
  deleteStudent,
  updateStudent,
  HandleUpdateAttendance,
  getStudentsForAttendanceUpdation,
  getViewStudents

}