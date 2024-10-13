import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import Interviewfinal from "../models/Interviewfinal.js";
import Shortlist from "../models/shortlist.js";
import AdminNotificationModel from "../models/Admin_notification.js";


router.get("/interview-link",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Interviewfinal.find({ "interviewalldetails.all_lists.userid": req.user.id }).sort({ "createdAt": -1 });   
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

router.get("/interview-shortlist",authMiddleware,async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await Shortlist.find({ "interviewalldetails.all_lists.userid": req.user.id }).sort({ "createdAt": -1 });   
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

router.get("/admin_notifications",async (req,res)=>{
    try {
        // const applications = await Applications.find({});
        const applications = await AdminNotificationModel.find({}).sort({ "createdAt": -1 });   
        // const jobpostingDetails = await Jobpostings.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!applications) {
            return res.status(404).json({ error: "notifcations not found" });
        }
        res.json(applications);
    } catch (error) {
        console.error("Error fetching interviewlink data:", error);
        res.status(500).json({ error: "Error while fetching notifications data" });
    }
})

export default router;