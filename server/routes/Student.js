const express=require('express');
const { HandleChangePassword } = require('../services/UpdatePassword');
const router=express.Router();
const mongoose = require("mongoose");
const { HandleInformation, HandleGetAnnouncements } = require('../controllers/Student');


router.post('/UpdatePassword', HandleChangePassword);
router.post('/GetAllDetails', HandleInformation);
router.get('/GetAnnouncements/:batch', HandleGetAnnouncements);

module.exports=router;