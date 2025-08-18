const express = require('express');
const { HandleChangePassword, HandleResetPassword} = require('../services/UpdatePassword');
const { HandelPostAnnouncements, 
        HandleMarkAttendance, 
        getDashboardData, 
        getLeaderBoardData, 
        getViewStudentData, 
        getProfileData, 
        getTimetableData, 
        getStudentData, 
        HandleAttendanceReportPDF,
        HandleAttendanceReportExcel
    } = require('../controllers/Faculty');
const router = express.Router();

router.get('/getDashboardData/:facultyid', getDashboardData);

router.get('/getLeaderBoardData', getLeaderBoardData);

router.get('/getViewStudentData', getViewStudentData);

router.get('/getStudentData', getStudentData);

router.get('/getProfileData/:facultyid',getProfileData);

router.patch('/UpdatePassword', HandleChangePassword);

router.post('/ResetPassword', HandleResetPassword);

router.post("/announcements", HandelPostAnnouncements);

router.post('/Mark-Attendance', HandleMarkAttendance);

router.get("/batch-report-excel/",HandleAttendanceReportExcel);

router.get("/batch-report-pdf", HandleAttendanceReportPDF);


module.exports = router;