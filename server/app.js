const express = require("express");
const connectDB = require("./Connect");
const mongoose=require('mongoose');
const LoginRouter = require('./routes/Login');
const StudentRouter = require('./routes/Student')
const FacultyRouter = require('./routes/Faculty')
const cors=require('cors');
const cron=require('node-cron');
const { updateAllStudentScores } = require("./controllers/Student");


const app = express();

app.use(cors())
app.use(express.json());

// DB -- CONNECTION

connectDB();



//  LOGIN ROUTE 
app.use('/api/login', LoginRouter);

//  Student Routes
app.use('/api/Student',StudentRouter);

//  Faculty Routes
app.use('/api/Faculty',FacultyRouter);




async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🚀 Connected to MongoDB");

    // Run once immediately
    await updateAllStudentScores();

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
