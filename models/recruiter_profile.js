import mongoose from "mongoose";

const RecruiterProfileSchema= new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true},
    password:{type:String,required:true},
});

const RecruiterProfileModel = mongoose.model('recruiterprofile',RecruiterProfileSchema)

export default RecruiterProfileModel;