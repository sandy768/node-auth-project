const AuthModel=require('../Model/authModel');
const bcrypt=require('bcryptjs');
const nodemailer=require('nodemailer');

// token setup
const TokenModel=require('../Model/tokenModel');
const jwt=require('jsonwebtoken');

// mail verification
const transporter=nodemailer.createTransport({
    host:'smtp',
    port:465,
    secure:false,
    requireTLS:true,
    service:'gmail',
    auth:{
        user:'sandiptomajumdar@gmail.com',
        pass:'hgmg sqwy nccp qxcx'
    }
})

const getAuthReg=(req,res)=>{
    let errEmail=req.flash("error");
    if(errEmail.length>0){
        errEmail=errEmail[0];
    }
    else{
        errEmail=null;
    }
    
    let verification=req.flash("msg");
    if(verification.length>0){
        verification=verification[0];
    }
    else{
        verification=null;
    }

    let mail_success=req.flash("reg-success");
    if(mail_success.length>0){
        mail_success=mail_success[0];
    }
    else{
        mail_success=null;
    }

    let token_err=req.flash("err-token");
    if(token_err.length>0){
        token_err=token_err[0];
    }
    else{
        token_err=null;
    }
    res.render('auth/registration',{
        title:"Registration Page",
        errorMail:errEmail,
        mailVerify:verification,
        mailSuccess:mail_success,
        error_token:token_err
    })
}
const postAuthReg=async(req,res)=>{
    try{
        let mail=req.body.email;
        let existing=await AuthModel.findOne({email:mail});
        console.log(existing);
        if(!existing){
            if(req.body.password===req.body.cnf_pass){
            let hashPassword=await bcrypt.hash(req.body.password,12);
            let authData=new AuthModel({
                full_name:req.body.name.toLowerCase(),
                email:req.body.email.toLowerCase(),
                password:hashPassword,
            });
            let saveData=await authData.save();
            if(saveData){
                console.log("User details is saved successfully");
                const token_jwt=jwt.sign(
                    {email:req.body.email},
                    "secretkey8753427@secretkey8753427",
                    {expiresIn:"1h"}
                );
                const Token_data=new TokenModel({
                    token:token_jwt,
                    _userId:saveData._id,
                });
                let token_save=await Token_data.save();
                if(token_save){
                    let mailTransporter={
                        from:'sandiptomajumdar@gmail.com',
                        to:req.body.email,
                        subject:"Email Verification",
                        text:'Hello'+" "+req.body.name+'\n\n'+
                        ',\n\nYou have successfully submitted your data to be registered.Please verify your account by clicking the link:\n'+
                        'http://'+
                        req.headers.host+
                        '/mail_confirmation/'+
                        req.body.email+
                        '/'+
                        token_jwt+
                        '\n\nThank you!\n'
                    }
                    transporter.sendMail(mailTransporter,function(error,info){
                        if(error){
                            console.log("Error to send mail",error);
                            res.redirect('/');
                        }
                        else{
                            // console.log("Successfully send mail",info.response);
                            req.flash('reg-success','Successfully registered, Please check your mail for mail verification');
                            res.redirect('/');
                        }
                    })
                }
                
            }
        }
        else{
            res.send("Password doesn't match");
        }
        }
        else{
            req.flash("error","Email already exists");
            res.redirect('/');
        }
    }
    catch(err){
        console.log("Error while collecting data",err);
    }
}
const mailVerification=async(req,res)=>{
    try{
        // console.log(req.params.token);
        let token_data=await TokenModel.findOne({token:req.params.token});
        // console.log(token_data);
        if(token_data){
            // console.log("Received mail from confirmation mail",req.params.email);
            let user_data=await AuthModel.findOne({email:req.params.email});
            if(user_data.isVerify){
                // console.log("User already verified");
                req.flash('msg','User already verified, go to login');
                res.redirect('/');
            }
            else{
                user_data.isVerify=true;
                let save_res=await user_data.save();
                if(save_res){
                    // console.log("Your account is successfully verified");
                    req.flash('success-verify','You have successfully verified, Sign In now')
                    res.redirect('/auth/logindata');
                }
            }
        }
        else{
            req.flash('err-token','Link is expired, Please go to your mail section again for mail verification');
            res.redirect('/')
        }
    }
    catch(err){
        console.log("Mail verification error",err);
        res.redirect('/');
    }
}
const getAuthRecovery=(req,res)=>{
    let wrongMail=req.flash("error_mail");
    if(wrongMail.length>0){
        wrongMail=wrongMail[0];
    }
    else{
        wrongMail=null;
    }
    res.render('auth/email',{
        title:"Password Recovery",
        invalidMail:wrongMail
    })
}
const postAuthRecovery=async(req,res)=>{
    try{
        let mail=req.body.email;
        let email_exist=await AuthModel.findOne({email:mail});
        // console.log(email_exist);
        if(email_exist){
            let emailTransporter={
                from:'sandiptomajumdar@gmail.com',
                to:req.body.email,
                subject:"Password Recovery",
                text:'Hello'+" "+email_exist.full_name+'\n\n'+
                '\n\nPlease recover your password by clicking this link:\n'+
                'http://'+
                req.headers.host+
                '/auth/forgotpass/'+
                req.body.email+
                '\n\nThank you!\n'
            }
            transporter.sendMail(emailTransporter,function(error,info){
                if(error){
                    console.log("Error to send mail",error);
                    res.redirect('/auth/logindata');
                }
                else{
                    console.log("Successfully send mail",info.response);
                    res.redirect('/auth/getrecovery');
                }
            })
        }
        else{
            req.flash('error_mail','Invalid Email Id');
            res.redirect('/auth/getrecovery');
        }
    }
    catch(err){
        console.log("Error while collecting email",err);
    }
}
const getForgotPass=async(req,res)=>{
    try{
        console.log("Collected mail",req.params.email);
        
            res.render('auth/forgotpass',{
                title:"Password Recovery",
                data:req.params.email
            })
        }
    catch(err){
        console.log("Error to show page",err);
    }
}
const postNewPass=async(req,res)=>{
    try{
        let old_data=await AuthModel.findOne({email:req.body.email});
        // console.log("Existing data",old_data);
        if(req.body.password===req.body.cnf_pass){
            let hashPassword=await bcrypt.hash(req.body.password,12);
            console.log("After hashing password",hashPassword);
            let updated_password=hashPassword;
            old_data.password=updated_password;
            let new_password=await old_data.save();
            if(new_password){
                req.flash('update_pass','Password updated successfully');
                res.redirect('/auth/logindata');
            }
            else{
                console.log("Error to update password");
            }
        }
        else{
            res.send("Password does not match");
        }
    }
    catch(err){
        console.log("Error to collect data",err);
    }
}
const getAuthLog=(req,res)=>{
    let passRecovery=req.flash("msg-email");
    if(passRecovery.length>0){
        passRecovery=passRecovery[0];
    }
    else{
        passRecovery=null;
    }
    
    let updatePass=req.flash("update_pass");
    if(updatePass.length>0){
        updatePass=updatePass[0];
    }
    else{
        updatePass=null;
    }
    
    let err_passkey=req.flash("err-pass");
    if(err_passkey.length>0){
        err_passkey=err_passkey[0];
    }
    else{
        err_passkey=null;
    }

    let invalidMail=req.flash('err-mail');
    if(invalidMail.length>0){
        invalidMail=invalidMail[0];
    }
    else{
        invalidMail=null;
    }

    let verify_success=req.flash('success-verify');
    if(verify_success.length>0){
        verify_success=verify_success[0]
    }
    else{
        verify_success=null;
    }
    res.render('auth/login',{
        title:"Sign Up Page",
        errRecovery:passRecovery,
        updatedPassword:updatePass,
        error_passkey:err_passkey,
        invalidEmail:invalidMail,
        successVerify:verify_success
    })
}
const postAuthLog=async(req,res)=>{
    try{
        let mail=req.body.email;
        let user_details=await AuthModel.findOne({email:mail});
        if(user_details){
            let pass_match=await bcrypt.compare(req.body.password,user_details.password);
            if(pass_match){
                req.session.isLoggedIn=true;
                req.session.user=user_details;
                await req.session.save(err=>{
                    if(err){
                        console.log("Session saving error",err);
                    }
                    else{
                        res.redirect('/auth/dashboard');
                    }
                })
            }
            else{
                req.flash('err-pass','Incorrect Password');
                res.redirect('/auth/logindata');
            }
        }
        else{
            req.flash('err-mail',"Invalid Email");
            res.redirect('/auth/logindata');
        }
    }
    catch(err){
        console.log("Error while collecting data",err);
    }
}
const getAuthDash=async(req,res)=>{
    try{
        let id=req.session.user._id;
        let user_info=await AuthModel.findById(id);
        if(user_info){
            res.render('auth/dashboard',{
                title:"User Dashboard",
                data:user_info
            })
        }
    }
    catch(err){
        console.log("Error to find user details",err);
    }
}
const getAuthLogout=async(req,res)=>{
    await req.session.destroy();
    res.redirect('/auth/logindata');
}
module.exports={
    getAuthReg,
    postAuthReg,
    mailVerification,
    getAuthRecovery,
    postAuthRecovery,
    getForgotPass,
    postNewPass,
    getAuthLog,
    postAuthLog,
    getAuthDash,
    getAuthLogout
}