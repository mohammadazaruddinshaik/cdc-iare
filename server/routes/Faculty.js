const express=require('express');
const { HandleResetPassword } = require('../services/UpdatePassword');
const { HandelPostAnnouncements, HandleMarkAttendance, HandleAttendanceReport , HandleAttendanceReportExcel } = require('../controllers/Faculty');
const router=express.Router();

router.post('/ResetPass', HandleResetPassword);

router.post("/announcements", HandelPostAnnouncements);

router.post('/Mark-Attendance', HandleMarkAttendance);

router.get("/attendance-report/:batch", HandleAttendanceReport);

router.get("/attendance-report-excel/:batch", HandleAttendanceReportExcel);



module.exports=router;