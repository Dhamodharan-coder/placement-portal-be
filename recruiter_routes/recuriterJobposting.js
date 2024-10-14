import express from "express";
import { v2 as cloudinary } from "cloudinary";
import Jobpostings from "../models/jobposting.js";
import upload from "../middleware/multer.js";
import Applications from "../models/applications.js";
import Student from "../models/student_profile.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Interviewlist from "../models/Interviewlist.js";
import Interviewfinal from "../models/Interviewfinal.js";
import Shortlist from "../models/shortlist.js";

const router = express.Router();


//recruiter job posting
router.post("/jobpostings",authMiddleware,upload.single("image"), async(req,res)=>{
    const { companyname, location, jobrole,salaryoffer,openings,jobdescription,lastdate} = req.body;
    const image = req.file;
    const recruiterid = req.user.id;


    if (!image) {
        return res.status(400).json({ error: "Image upload failed!" });
    }

    try {
        
        const imageUpload = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const newjobposting = new Jobpostings({
            companyname, location, jobrole,salaryoffer,openings,jobdescription,lastdate,recruiterid,
            image: imageUrl,
        });

        await newjobposting.save();
        res.status(200).json({
            message: "job post uploaded successfully",
            data: {
                companyname, location, jobrole,salaryoffer,openings,jobdescription,lastdate,recruiterid,
                image: imageUrl,
            },
         
        });
    } catch (error) {
        console.error("Error during posting job:", error);
        res.status(500).json({ error: "job Upload failed!" });
    }
})

//individual company job list details
router.get("/my-jobpostings-details",authMiddleware,async (req,res)=>{
    try {
        // const jobpostingDetails = await Jobpostings.find({});
        const jobpostingDetails = await Jobpostings.find({"recruiterid":req.user.id}).sort({ "createdAt": -1 });// req.user.id should be set by your authMiddleware
        if (!jobpostingDetails) {
            return res.status(404).json({ error: "jobpostings not found" });
        }
        res.json(jobpostingDetails);
    } catch (error) {
        console.error("Error fetching jobs data:", error);
        res.status(500).json({ error: "Error while fetching jobs data" });
    }
})
router.delete("/my-jobpostings-details/:id",authMiddleware,async (req,res)=>{
    try {
      
        // const jobpostingDetails = await Jobpostings.find({});
        const jobpostingDetails = await Jobpostings.findByIdAndDelete({"_id":req.params.id});// req.user.id should be set by your authMiddleware
        if (!jobpostingDetails) {
            return res.status(404).json({ error: "Error While deleting" });
        }
        res.status(200).json({message:"Deleted Successfully"});
    } catch (error) {
        console.error("Error fetching jobs data:", error);
        res.status(500).json({ error: "Error while fetching jobs data" });
    }
})
//all job list details
router.get("/jobpostings-details",async (req,res)=>{
    try {
        const jobpostingDetails = await Jobpostings.find({}).sort({ "createdAt": -1 });

        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!jobpostingDetails) {
            return res.status(404).json({ error: "jobpostings not found" });
        }
        res.json(jobpostingDetails);
    } catch (error) {
        console.error("Error fetching jobs data:", error);
        res.status(500).json({ error: "Error while fetching jobs data" });
    }
})

//applications applied by student
router.post("/applied-list",authMiddleware,async(req,res)=>{
    try {
        const appliedstatus = await Jobpostings.findById(req.body.id);
        const userdetail = await Student.findById(req.user.id).select("-password");

const applied ={
    userid: req.user.id,
    applicationid: req.body.id,
    applicationdata:appliedstatus,
    userdetails: userdetail
}


    const applications = new Applications(applied);
    await applications.save();

    } catch (error) {
        console.error("there is an error",error);
        res.status(500).json({message: "Error apply job"});
    }
})
//individual user applications
router.get("/applied-list",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});

        const applications = await Applications.find({ userid: req.user.id }).sort({ "createdAt": -1 });
        
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "applications not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications data:", error);
        res.status(500).json({ error: "Error while fetching applications data" });
    }
})
//all user applications in recruiter
router.get("/applied-list-all",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Applications.find({ "applicationdata.recruiterid": req.user.id }).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "applications not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications data:", error);
        res.status(500).json({ error: "Error while fetching applications data" });
    }
})
//recruiter control for shortlist
router.put("/update-application/:id", authMiddleware, async (req, res) => {
    const applicationId = req.params.id;  // The application ID from the URL parameter
    const { status, assessmentStatus, assessmentLink } = req.body;  // Extracted from request body
  
    try {
        // Find the application by applicationId
        const updatedApplication = await Applications.findById(applicationId);
  
        // If the application is not found, return 404
        if (!updatedApplication) {
            return res.status(404).json({ error: "Application not found" });
        }
  
        // Update application details
        updatedApplication.status = status;
        updatedApplication.assessmentstatus = assessmentStatus;
        updatedApplication.assessmentlink = assessmentLink;
  
        // Save the updated application
        await updatedApplication.save();

        let message = "Application updated successfully"; // Base message
  
        // Handle the Interview List logic after saving the application
        if (updatedApplication.status === "shortlisted" && updatedApplication.assessmentstatus === "selected") {
            // If application is shortlisted and selected, add it to the Interview list
            const list = await Applications.findById(applicationId);  // Find the application
            const finallist = {
                Interviewlistid: applicationId,
                all_lists: list,  // Store the application data in all_lists
            };
  
            const interview = new Interviewlist(finallist);  // Create new Interviewlist with the data
            await interview.save();
            message = "Application updated and added to interview list";
  
        } else if (
            updatedApplication.status === "pending" || updatedApplication.status === "rejected" ||
            updatedApplication.assessmentstatus === "pending" || updatedApplication.assessmentstatus === "rejected"
        ) {
            // If application is pending or rejected, delete from the Interview list
            const response = await Interviewlist.findOneAndDelete({ Interviewlistid: applicationId });

            // Only delete if something is found in the Interviewlist
            if (response) {
                message = "Application updated and removed from interview list";
            }
        }
  
        // Return the updated application and message as the response
        res.status(200).json({ message, updatedApplication });
  
    } catch (error) {
        console.error("Error updating application:", error);
        res.status(500).json({ error: "Error while updating application" });
    }
});

//interview schedule link
  router.get("/interview-list-all",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Interviewlist.find({ "all_lists.applicationdata.recruiterid": req.user.id }).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "Inteviewlist not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications data:", error);
        res.status(500).json({ error: "Error while fetching inverviewlist data" });
    }
})

//interview timing and details
router.post("/interview-link",authMiddleware,async(req,res)=>{
    try {
        
        const {link,date,time,userid,applicationid} = req.body
        
        
        const interviewList = await Interviewlist.find({
            $and: [
              { "all_lists.userid": userid },
              { "all_lists.applicationdata.recruiterid": req.user.id },
              { "all_lists.applicationid": applicationid }
            ]
          }).select("all_lists.applicationdata all_lists.userdetails all_lists.userid");
const interviewdetails = {
    links : link,
    dates : date,
    times : time,
    interviewalldetails: interviewList,
}


    const applications = new Interviewfinal(interviewdetails);
    await applications.save();
    res.status(200).json({message: "Interview Scheduled",applications});

    } catch (error) {
        console.error("there is an error",error);
        res.status(500).json({message: "Error interview scheduling"});
    }
})

router.get("/interview-link",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Interviewfinal.find({ "interviewalldetails.all_lists.applicationdata.recruiterid": req.user.id }).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "interviewlink not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching interviewlink data:", error);
        res.status(500).json({ error: "Error while fetching interviewlink data" });
    }
})

router.post("/interview-shortlist",authMiddleware,async(req,res)=>{
    try {
        const {shortlistresult,id} = req.body

       
        const userdetail = await Interviewfinal.find({"_id":id})
        
const shortlistdetails = {
    shortliststatus:shortlistresult,
    interviewalldetails: userdetail,
}


    const applications = new Shortlist(shortlistdetails);
    await applications.save();
   
    res.status(200).json({message: "shortlist details fetched",applications});

    } catch (error) {
        console.error("there is an error",error);
        res.status(500).json({message: "Error fetching details"});
    }
})

router.get("/interview-shortlist",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Shortlist.find({ "interviewalldetails.interviewalldetails.all_lists.applicationdata.recruiterid": req.user.id }).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "shortlist not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching interviewlink data:", error);
        res.status(500).json({ error: "Error while fetching shortlist data" });
    }
})

router.delete("/interview-shortlist/:id",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Shortlist.findByIdAndDelete({ "_id": req.params.id });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "shortlist not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching interviewlink data:", error);
        res.status(500).json({ error: "Error while fetching shortlist data" });
    }
})


export default router;