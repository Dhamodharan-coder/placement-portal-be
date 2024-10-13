import mongoose from "mongoose";

const StudentProfileSchema= new mongoose.Schema({
    name: {type:String, required:true},
    image: {type:String, required:true},
    email: {type:String, required:true},
    regno:{type:String,required: true},
    password:{type:String,required:true},
    number:{type: Number, required: true},
    degree:{type:String,required: true},
    cgpa:{type:Number,required: true},
    skills:{type:String,required: true},
    resume:{type:String,required: true}
});

const StudentProfileModel = mongoose.model('studentprofile',StudentProfileSchema)

export default StudentProfileModel;