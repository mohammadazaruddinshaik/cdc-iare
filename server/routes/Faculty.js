const express = require('express');
const { HandelPostAnnouncements,  
        getDashboardData, 
        getProfileData, 
        getStudentData } = require('../controllers/Faculty');

const { getLeaderBoardData, 
        HandleResetPassword, 
        HandleChangePassword, 
        getViewStudentData, 
        HandleBatchAttendanceReportExcel, 
        HandleBatchAttendanceReportPDF, 
        HandleMarkAttendance} = require('../services/CommonRoutes');

const router = express.Router();

router.get('/getDashboardData/:facultyid', getDashboardData);

router.get('/getLeaderBoardData', getLeaderBoardData);

router.get('/getViewStudentData', getViewStudentData);

router.get('/getStudentData/:rollno', getStudentData);

router.get('/getProfileData/:facultyid',getProfileData);

router.patch('/UpdatePassword', HandleChangePassword);

router.patch('/ResetPassword', HandleResetPassword);

router.post("/announcements", HandelPostAnnouncements);

router.post('/Mark-Attendance', HandleMarkAttendance);

router.get("/batch-report-excel/",HandleBatchAttendanceReportExcel);

router.get("/batch-report-pdf", HandleBatchAttendanceReportPDF);


module.exports = router;