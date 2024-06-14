require('dotenv').config();
const express=require('express');
const appServer=express();
const path=require('path');
const mongoose=require('mongoose');
const PORT=process.env.PORT||4000;

const flash=require('connect-flash');
const session=require('express-session');
const mongodb_session=require('connect-mongodb-session')(session);

const authRouter=require('./Router/authRouter');
const AuthModel=require('./Model/authModel');

appServer.set('view engine','ejs');
appServer.set('views','View');

appServer.use(express.urlencoded({extended:true}));
appServer.use(flash());

appServer.use(express.static(path.join(__dirname,'Public')));

const session_store=new mongodb_session({
    uri:process.env.DB_URL,
    collection:'session-data'
})

appServer.use(session({
    secret:'project-secret-key',
    resave:false,
    saveUninitialized:false,
    store:session_store
}))

appServer.use(async(req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    let userData=await AuthModel.findById(req.session.user._id);
    if(userData){
        req.user=userData;
        next();
    }
    else{
        console.log("User not found");
    }
})

appServer.use(authRouter);
mongoose.connect(process.env.DB_URL)
.then(res=>{
    console.log("Database connected successfully");
    appServer.listen(PORT,()=>{
        console.log(`Server is running at http://localhost:${PORT}`);
    })
})
.catch(err=>{
    console.log("Database not connected yet",err);
})