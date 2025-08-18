const express=require('express');
const { AttendanceSessionReportEx, AttendanceSessionReportPdf, AttendanceCompleteReportEx, AttendanceCompleteReportPdf, AttendanceBatchReportEx, AttendanceBatchReportPdf } = require('../controllers/Admin');
const router=express.Router();


router.get('/attendance-session-report-excel',AttendanceSessionReportEx);
router.get('/attendance-session-report-pdf', AttendanceSessionReportPdf);
router.get("/attendance/complete-report-excel/:collectionName",AttendanceCompleteReportEx);
router.get("/attendance/complete-report-pdf/:collectionName",AttendanceCompleteReportPdf);
router.get("/attendance-batch-report-excel", AttendanceBatchReportEx);
router.get("/attendance-batch-report-pdf", AttendanceBatchReportPdf);

module.exports=router;