const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const AuthSchema=new Schema({
    full_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerify:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true,
    versionKey:false,
});

const AuthModel=new mongoose.model('details',AuthSchema);
module.exports=AuthModel;
