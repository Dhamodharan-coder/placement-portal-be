import express from "express";
import cors from "cors";
import connectDB from "./database/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import dotenv from 'dotenv';
import studentdetails from "./routes/studentdetails.js"
import recuriterJobposting from "./recruiter_routes/recuriterJobposting.js"
import recruiterdetails from "./recruiter_routes/recruiterdetails.js"
import studentinterview from "./routes/studentinterviewdetails.js"
import admindetails from "./Admin_routes/admindetails.js"
// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = 3000;

app.use("/files", express.static("uploads"));
app.use(express.json());
app.use(cors());


connectDB();
connectCloudinary();

app.use("/admin",admindetails);
app.use("/recruiter",recruiterdetails);
app.use("/student",studentdetails);
app.use("/student", studentinterview);
app.use("/recruiter",recuriterJobposting);

app.get("/", (req, res) => {
    res.json("API is Working");
});




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
