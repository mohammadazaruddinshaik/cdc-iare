const cron = require('node-cron');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Student = require('../models/student');
require("dotenv").config();

const SECRET_KEY = process.env.Attendance_Secret;

// Function to generate and update QR codes for all students
async function generateAndStoreQrCodes() {
  try {
    console.log("Starting daily QR code generation...");

    const today = new Date().toISOString().slice(0, 10);
    const students = await Student.find({});
    if (students.length === 0) return console.log("No students found to update.");

    const bulkOps = [];

    for (const student of students) {
      const dataToHash = `${student.rollno}:${today}:${SECRET_KEY}`;
      const hash = crypto.createHash("sha256").update(dataToHash).digest("hex");

      const qrData = hash;
      const qrPayload = JSON.stringify({ rollno: student.rollno, hash });
      const qrDataUrl = await QRCode.toDataURL(qrPayload);

      bulkOps.push({
        updateOne: {
          filter: { _id: student._id },
          update: { $set: { qrData, qrLink: qrDataUrl } }
        }
      });
    }

    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
    }

    console.log(`Successfully updated QR codes for ${students.length} students.`);
  } catch (error) {
    console.error("Error during daily QR code update:", error);
  }
}


// Function to update QR "hash" data
// async function updateQrData() {
//   try {
//     const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

//     const createHash = (data) => crypto.createHash('sha256').update(data).digest('hex');

//     const cursor = Student.find({});
//     for await (const student of cursor) {
//       const rollNo = student.rollno;
//       const dataToHash = `${rollNo}${today}${SECRET_KEY}`;
//       const qrData = createHash(dataToHash);

//       await Student.updateOne(
//         { _id: student._id },
//         { $set: { qrData: qrData } }
//       );
//       console.log(`Updated QR data for student with roll number: ${rollNo}`);
//     }

//     console.log('QR data update completed successfully.');
//   } catch (e) {
//     console.error('An error occurred during the update:', e);
//   } finally {
//     console.log('Connection closed.');
//   }
// }

module.exports = generateAndStoreQrCodes;
