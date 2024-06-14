const express=require('express');
const router=express.Router();
const {getAuthReg,postAuthReg,mailVerification,getAuthRecovery,postAuthRecovery,getForgotPass,postNewPass,getAuthLog,postAuthLog,getAuthDash,getAuthLogout}=require('../Controller/authController');

router.get('/',getAuthReg);
router.post('/auth/postreg',postAuthReg);
router.get('/mail_confirmation/:email/:token',mailVerification);
router.get('/auth/getrecovery',getAuthRecovery);
router.post('/auth/postrecovery',postAuthRecovery);
router.get('/auth/forgotpass/:email',getForgotPass);
router.post('/auth/updatepass',postNewPass);
router.get('/auth/logindata',getAuthLog);
router.post('/auth/postlogin',postAuthLog);
router.get('/auth/dashboard',getAuthDash);
router.get('/auth/logout',getAuthLogout);

module.exports=router;