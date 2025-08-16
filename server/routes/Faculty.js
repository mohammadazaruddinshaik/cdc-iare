const express=require('express');
const { HandleResetPassword } = require('../services/UpdatePassword');
const router=express.Router();

router.post('/ResetPass', HandleResetPassword);

module.exports=router;