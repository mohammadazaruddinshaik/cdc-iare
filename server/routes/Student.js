const express=require('express');
const { HandleChangePassword } = require('../services/UpdatePassword');
const router=express.Router();
const mongoose = require("mongoose");
const { getDashboardData, HandleGetAnnouncements, getLeaderBoardData, getLogData, getProfileData } = require('../controllers/Student');


router.post('/UpdatePassword', HandleChangePassword);
router.post('/getDashboardData', getDashboardData);
router.post('/getLeaderBoardData', getLeaderBoardData);
router.post('/getLogData', getLogData);
router.post('/getProfileData', getProfileData);
router.get('/GetAnnouncements/:batch', HandleGetAnnouncements);

module.exports=router;