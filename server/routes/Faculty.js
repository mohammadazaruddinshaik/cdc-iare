const express = require('express');
const { HandleChangePassword, HandleResetPassword} = require('../services/UpdatePassword');
const { HandelPostAnnouncements, 
        HandleMarkAttendance, 
        HandleAttendanceReport, 
        HandleAttendanceReportExcel, 
        getDashboardData, 
        getLeaderBoardData, 
        getViewStudentData, 
        getProfileData, 
        getTimetableData, 
        getStudentData 
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

router.get("/batch-report/:batch",HandleAttendanceReport);

router.get("/batch-report-pdf/:batch", HandleAttendanceReportExcel);


module.exports = router;