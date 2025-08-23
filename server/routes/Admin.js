const express=require('express');
const router=express.Router();
const ExcelJS = require('exceljs');
const {HandleSessionAttendanceReportPDF, 
      HandleSessionAttendanceReportExcel,  
      HandleMonthlyAttendanceReportExcel,
      getDashboardData,
      addFaculty,
      deleteFaculty,
      updateFaculty,
      addStudent,
      deleteStudent,
      updateStudent,
      HandleUpdateAttendance, 
      getViewStudents,
      getStudentsForAttendanceUpdation,
      getViewFaculty} = require('../controllers/Admin');

const getAttendanceModel=require('../services/GetAttendanceModel');

const { HandleChangePassword,
        getViewStudentData, 
        getLeaderBoardData, 
        HandleResetPassword, 
        HandleBatchAttendanceReportPDF, 
        HandleBatchAttendanceReportExcel, 
        HandleMarkAttendance} = require('../services/CommonRoutes');




router.get("/attendance-batch-report-excel", HandleBatchAttendanceReportExcel);

router.get("/attendance-batch-report-pdf", HandleBatchAttendanceReportPDF);

router.get("/attendance-Session-report-excel", HandleSessionAttendanceReportExcel);

router.get("/attendance-Session-report-pdf", HandleSessionAttendanceReportPDF);

router.post('/Mark-Attendance', HandleMarkAttendance);

router.get('/attendance-monthly-excel', HandleMonthlyAttendanceReportExcel)

router.patch('/UpdatePassword', HandleChangePassword);

router.get('/getDashboardData',getDashboardData);

router.get('/getLeaderboardData', getLeaderBoardData);

router.get('/getViewStudentData', getViewStudentData);

router.patch('/ResetPassword', HandleResetPassword);

//-------------------------------   Manage Faculty Routes  Start    ----------------------------//

router.get('/getViewFaculty',getViewFaculty)

router.post('/addFaculty', addFaculty);

router.delete('/deleteFaculty', deleteFaculty);

router.patch('/updateFaculty', updateFaculty);

//-------------------------------   Manage Faculty Routes  End      ----------------------------//


//-------------------------------   Manage Student Routes  Start    ----------------------------//

router.get('/getViewStudents',getViewStudents);

router.post('/addStudent', addStudent);

router.delete('/deleteStudent', deleteStudent);

router.patch('/updateStudent', updateStudent);

//-------------------------------   Manage Student Routes  End      ----------------------------//


//-------------------------------   Manage Attendance Routes  Start -----------------------------//

router.get('/getAbsenties', getStudentsForAttendanceUpdation);

router.patch('/updateAttendance', HandleUpdateAttendance);

//-------------------------------   Manage Attendance Routes  Start -----------------------------//

module.exports=router;