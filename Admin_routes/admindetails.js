import express from "express";
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For JWT token generation
import dotenv from "dotenv";
import AdminProfileModel from "../models/Admin_profile.js";
import upload from "../middleware/multer.js";
import { v2 as cloudinary } from "cloudinary";
import AdminNotificationModel from "../models/Admin_notification.js";
import authMiddleware from "../middleware/authMiddleware.js";
import jobpostingModel from "../models/jobposting.js";
import RecruiterProfileModel from "../models/recruiter_profile.js";
import StudentProfileModel from "../models/student_profile.js";
import Applications from "../models/applications.js";
import Interviewfinal from "../models/Interviewfinal.js";
import Shortlist from "../models/shortlist.js";




const router = express.Router();

dotenv.config();


router.post("/admin-register",async (req,res)=>{
    const { email, password } = req.body;
    try {

         // Hash the password
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(password, saltRounds);

         const newAdmin = new AdminProfileModel({
            
            email,
            password: hashedPassword, // Save the hashed password
        });

        await newAdmin.save();

        const token = jwt.sign(
            { userId: newAdmin._id, email: newAdmin.email },
            process.env.JWT_SECRET, // Ensure you have JWT_SECRET in your .env file
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Account registered successfully",
            data: {
                email
            },
            token
        });
        
    } catch (error) {
        console.error("Error during admin registration:", error);
        res.status(500).json({ error: "admin registration failed!" });
    }

})

router.post("/admin-login", async (req, res) => {
  

    try {
        const user = await AdminProfileModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "Incorrect Username/Password" });
        }

        const passwordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!passwordCorrect) {
            return res.status(404).json({ message: "Incorrect Username/Password" });
        }

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

//admin notifications

router.post("/admin-notifications",authMiddleware, upload.fields([{ name: "image" }, { name: "imagetwo" }, { name: "imagethree" }]), async (req, res) => {
    
    // Access uploaded files
    const image = req.files['image'] ? req.files['image'][0] : null;
    const imagetwo = req.files['imagetwo'] ? req.files['imagetwo'][0] : null;
    const imagethree = req.files['imagethree'] ? req.files['imagethree'][0] : null;

    // Check if image, imagetwo, and imagethree are uploaded
    if (!image) {
        return res.status(400).json({ error: "Image upload failed!" });
    }
    if (!imagetwo) {
        return res.status(400).json({ error: "imagetwo upload failed!" });
    }
    if (!imagethree) {
        return res.status(400).json({ error: "imagethree upload failed!" });
    }

    try {
        // Upload the images to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const imageUploadtwo = await cloudinary.uploader.upload(imagetwo.path, { resource_type: "image" });
        const imageUrltwo = imageUploadtwo.secure_url;

        const imageUploadthree = await cloudinary.uploader.upload(imagethree.path, { resource_type: "image" });
        const imageUrlthree = imageUploadthree.secure_url;

        // Create new admin notification and save to database
        const Adminnotification = new AdminNotificationModel({
            userid: req.user.id,
            image: imageUrl,
            imagetwo: imageUrltwo,
            imagethree: imageUrlthree,
        });

        await Adminnotification.save();

        // Respond with success message
        res.status(200).json({
            message: "Images uploaded successfully",
            data: {
                image: imageUrl,
                imagetwo: imageUrltwo,
                imagethree: imageUrlthree,
            }
        });
    } catch (error) {
        console.error("Error during upload failed:", error);
        res.status(500).json({ error: "Admin upload failed!" });
    }
});

router.put("/admin-notifications", authMiddleware, upload.fields([{ name: "image" }, { name: "imagetwo" }, { name: "imagethree" }]), async (req, res) => {
    // Access uploaded files
    const image = req.files['image'] ? req.files['image'][0] : null;
    const imagetwo = req.files['imagetwo'] ? req.files['imagetwo'][0] : null;
    const imagethree = req.files['imagethree'] ? req.files['imagethree'][0] : null;
    

    try {
        // Find the existing AdminNotification by user ID
        const adminNotification = await AdminNotificationModel.findOne({ userid: req.user.id }); // Use findOne here

        if (!adminNotification) {
            return res.status(404).json({ error: "Admin notification not found!" });
        }

        // Check if image, imagetwo, and imagethree are uploaded, and update only if new files are provided
        if (image) {
            const imageUpload = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
            adminNotification.image = imageUpload.secure_url;
        }

        if (imagetwo) {
            const imageUploadtwo = await cloudinary.uploader.upload(imagetwo.path, { resource_type: "image" });
            adminNotification.imagetwo = imageUploadtwo.secure_url;
        }

        if (imagethree) {
            const imageUploadthree = await cloudinary.uploader.upload(imagethree.path, { resource_type: "image" });
            adminNotification.imagethree = imageUploadthree.secure_url;
        }

        // Save the updated admin notification
        await adminNotification.save();

        // Respond with success message
        res.status(200).json({
            message: "Images updated successfully",
            data: {
                image: adminNotification.image,
                imagetwo: adminNotification.imagetwo,
                imagethree: adminNotification.imagethree,
            }
        });
    } catch (error) {
        console.error("Error during update:", error);
        res.status(500).json({ error: "Admin update failed!" });
    }
});



//adminrecruiter
router.get("/admin-recruiter-details",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await RecruiterProfileModel.find({}).sort({ "createdAt": -1 }).select("-password");   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "company not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching companys data:", error);
        res.status(500).json({ error: "Error while fetching companys data" });
    }
})

router.get("/admin-recruiter-jobpostings",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await jobpostingModel.find({}).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "company not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching companys data:", error);
        res.status(500).json({ error: "Error while fetching companys data" });
    }
})


//students
router.get("/admin-student-details",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await StudentProfileModel.find({}).sort({ "createdAt": -1 }).select("-password");   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "company not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching companys data:", error);
        res.status(500).json({ error: "Error while fetching companys data" });
    }
})

router.delete("/admin-student-details/:id",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await StudentProfileModel.findByIdAndDelete(req.params.id)  
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "student not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ error: "Error while fetching student data" });
    }
})

router.get("/admin-students-applications",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Applications.find({}).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "student applications not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching student applications data:", error);
        res.status(500).json({ error: "Error while fetching students applications data" });
    }
})
router.get("/admin-students-interviewfinal",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Interviewfinal.find({}).sort({ "createdAt": -1 })  
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "student applications not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching student applications data:", error);
        res.status(500).json({ error: "Error while fetching students applications data" });
    }
})
router.get("/admin-students-shortlist",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Shortlist.find({}).sort({ "createdAt": -1 })  
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "student applications not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching student applications data:", error);
        res.status(500).json({ error: "Error while fetching students applications data" });
    }
})



export default router;
