require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const LoginRouter = require('./routes/Login');
const StudentRouter = require('./routes/Student')
const FacultyRouter = require('./routes/Faculty')
const cors=require('cors');


const app = express();

app.use(cors())
app.use(express.json());


// CONNECT MONGODB 
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));


//  LOGIN ROUTE 
app.use('/api/login', LoginRouter);

//  Student Routes
app.use('/api/Student',StudentRouter);

//  Faculty Routes
app.use('/api/Faculty',FacultyRouter);



app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
