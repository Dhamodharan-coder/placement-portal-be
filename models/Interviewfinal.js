import mongoose from "mongoose";

const InterviewfinalSchema = new mongoose.Schema({
    dates : {type:Date,required:true},
    links : {type:String,required:true},
    times : {type:String,required:true},
    interviewalldetails: {type:Array},
});

// Check if the model already exists before creating it
const Interviewfinal = mongoose.model('interviewfinal', InterviewfinalSchema);

export default Interviewfinal;
