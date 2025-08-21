const express=require('express');
const router=express.Router();
const ExcelJS = require('exceljs');
const {HandleSessionAttendanceReportPDF, 
      HandleBatchAttendanceReportPDF, 
      HandleBatchAttendanceReportExcel, 
      HandleSessionAttendanceReportExcel, 
      HandleMarkAttendance, 
      HandleMonthlyAttendanceReportExcel,
      getDashboardData
    
    } = require('../controllers/Admin');
const getAttendanceModel=require('../services/GetAttendanceModel');
const { HandleChangePassword } = require('../services/CommonRoutes');



router.get("/attendance-batch-report-excel", HandleBatchAttendanceReportPDF);

router.get("/attendance-batch-report-pdf", HandleBatchAttendanceReportExcel);

router.get("/attendance-Session-report-excel", HandleSessionAttendanceReportExcel);

router.get("/attendance-Session-report-pdf", HandleSessionAttendanceReportPDF);

router.post('/Mark-Attendance', HandleMarkAttendance);

router.get('/attendance-monthly-excel', HandleMonthlyAttendanceReportExcel)

router.patch('/UpdatePassword', HandleChangePassword);

router.get('/getDashboardData',getDashboardData);

module.exports=router;