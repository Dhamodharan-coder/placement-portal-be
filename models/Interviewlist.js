import mongoose from "mongoose";

const InterviewlistSchema = new mongoose.Schema({
    all_lists: { type: Array },
    Interviewlistid: {type: String}
});

// Check if the model already exists before creating it
const Interviewlist = mongoose.model('interviewlist', InterviewlistSchema);

export default Interviewlist;
