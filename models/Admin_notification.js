import mongoose from "mongoose";


const AdminNotificationSchema= new mongoose.Schema({
    userid: {type:String,required:true},
    image: {type:String, required:true},
    imagetwo: {type:String, required:true},
    imagethree: {type:String, required:true},
});

const AdminNotificationModel = mongoose.model('adminnotifications',AdminNotificationSchema)

export default AdminNotificationModel;