
import mongoose from "mongoose";


const applicationsSchema = new mongoose.Schema({
    status:{type:String,default:"pending"},
    assessmentstatus:{type:String,default:"pending"},
    appliedstatus:{type:String,default:"applied"},
    assessmentlink:{type:String,default:"exam"},
    applicationid:{type:String},
    userid:{type:String},
applicationdata:{type:Array},
userdetails:{type:Array}
},{ timestamps: true })

const Applications= mongoose.model('applications', applicationsSchema);

export default Applications;