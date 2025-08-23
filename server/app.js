const express = require("express");
const connectDB = require("./Connect");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const LoginRouter = require("./routes/Login");
const StudentRouter = require("./routes/Student");
const FacultyRouter = require("./routes/Faculty");
const AdminRouter = require("./routes/Admin");

const { updateAllStudentScores } = require("./controllers/Student");
const { generateAndStoreQrCodes, updateQrData } = require("./services/QrCodeGeneration");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/api/login", LoginRouter);
app.use("/api/Student", StudentRouter);
app.use("/api/Faculty", FacultyRouter);
app.use("/api/Admin", AdminRouter);

// updateQrData();
// generateAndStoreQrCodes();
// ================== CRON JOBS ================== //
function setupCronJobs() {
  // 🕐 1:00 AM IST → Generate QR Codes + QR Data
  cron.schedule(
    "52 21 * * *",
    async () => {
      console.log("🚀 Running scheduled QR updates at 1:00 AM IST...");
      try {
        await generateAndStoreQrCodes();
        await updateQrData();
        console.log("✅ QR code and QR data update completed.");
      } catch (err) {
        console.error("❌ Error running scheduled QR updates:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  // 🕝 2:30 AM IST → Update Student Scores
  cron.schedule(
    "48 22 * * *",
    async () => {
      console.log("🚀 Running scheduled student score update at 2:30 AM IST...");
      try {
        await updateAllStudentScores();
        console.log("✅ Student scores updated successfully.");
      } catch (err) {
        console.error("❌ Error updating student scores:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
}
// =============================================== //

setupCronJobs();

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
