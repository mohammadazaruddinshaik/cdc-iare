const express = require("express");
const connectDB = require("./Connect");
const mongoose=require('mongoose');
const LoginRouter = require('./routes/Login');
const StudentRouter = require('./routes/Student')
const FacultyRouter = require('./routes/Faculty')
const AdminRouter = require('./routes/Admin')
const cors=require('cors');
const cron=require('node-cron');
const bcrypt = require("bcryptjs");
const { updateAllStudentScores } = require("./controllers/Student");
const { HandleAllPasswordsHashing } = require("./services/PasswordHash");


const app = express();

app.use(cors())
app.use(express.json());

// DB -- CONNECTION

connectDB();

// ROUTES
app.use('/api/login', LoginRouter);
app.use('/api/Student',StudentRouter);
app.use('/api/Faculty',FacultyRouter);
app.use('/api/Admin',AdminRouter);



async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🚀 Connected to MongoDB");

    // Run once immediately
    // await updateAllStudentScores();

    // Schedule every day at 2:30 AM IST
    cron.schedule("30 2 * * *", updateAllStudentScores, {
      timezone: "Asia/Kolkata",
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

start();

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
