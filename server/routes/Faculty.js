const express=require('express');
const { HandleResetPassword } = require('../services/UpdatePassword');
const { HandelPostAnnouncements, HandleMarkAttendance, HandleAttendanceReport , HandleAttendanceReportExcel } = require('../controllers/Faculty');
const router=express.Router();

router.post('/ResetPass', HandleResetPassword);

router.post("/announcements", HandelPostAnnouncements);

router.post('/Mark-Attendance', HandleMarkAttendance);

router.post("/attendance-report", HandleAttendanceReport);

router.post("/attendance-report-excel", HandleAttendanceReportExcel);



module.exports=router;