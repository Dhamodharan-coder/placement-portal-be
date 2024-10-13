import mongoose from "mongoose";

const ShortlistSchema = new mongoose.Schema({
    shortliststatus: {type:String,required:true},
    interviewalldetails: {type:Array},
});

// Check if the model already exists before creating it
const Shortlist = mongoose.model('shortlist', ShortlistSchema);

export default Shortlist;
