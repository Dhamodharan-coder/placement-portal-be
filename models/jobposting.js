import mongoose from "mongoose";

const jobpostingSchema = new mongoose.Schema({
  recruiterid:{type:String},
  companyname: { type: String, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  jobrole: { type: String, required: true },
  salaryoffer: { type: String, required: true },
  openings: { type: Number, required: true },
  jobdescription: { type: String, required: true },
  lastdate: { type: Date, required: true },
}, { timestamps: true });  // This option adds createdAt and updatedAt fields automatically

const jobpostingModel = mongoose.model('jobposting', jobpostingSchema);

export default jobpostingModel;
