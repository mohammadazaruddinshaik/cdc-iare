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
const  generateAndStoreQrCodes = require("./services/QrCodeGeneration");

const app = express();
const cookieParser = require("cookie-parser");

// Middlewares
app.use(cookieParser());
app.use(express.json()); // ✅ only once
app.use(cors({
 origin: [
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "https://cdc-portal-sigma.vercel.app",
    "https://cdc-portal-7ufq3fho3-tavva-sandeep-kumar-reddys-projects.vercel.app"
  ],  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// app.use(cors())

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
    "38 00 * * *",
    async () => {
      console.log("🚀 Running scheduled QR updates at 1:00 AM IST...");
      try {
        await generateAndStoreQrCodes();
        console.log("✅ QR code and QR data update completed.");
      } catch (err) {
        console.error("❌ Error running scheduled QR updates:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  // 🕝 2:30 AM IST → Update Student Scores
  cron.schedule(
    "31 23 * * *",
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
