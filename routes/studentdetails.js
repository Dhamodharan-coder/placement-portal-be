import express from "express";
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For JWT token generation
import upload from "../middleware/multer.js";
import { v2 as cloudinary } from "cloudinary";
import Student from "../models/student_profile.js"; // Assuming you have a Student model for the database
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware.js";



const router = express.Router();

dotenv.config();



// POST Route for student registration
router.post("/student-register", upload.fields([{ name: "image" }, { name: "resume" }]), async (req, res) => {
    const { name, email, number, degree, cgpa, skills, password, regno } = req.body;
    const image = req.files.image ? req.files.image[0] : null;
    const resume = req.files.resume ? req.files.resume[0] : null;

    // Check if image and resume are uploaded
    if (!image) {
        return res.status(400).json({ error: "Image upload failed!" });
    }
    if (!resume) {
        return res.status(400).json({ error: "Resume upload failed!" });
    }

    try {
        // Check if user already exists
        const existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already registered with this email!" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Upload the image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const resumeUrl = `files/${resume.filename}`;

        // Create new student and save to database
        const newStudent = new Student({
            name,
            email,
            number,
            degree,
            cgpa,
            skills,
            password: hashedPassword, // Save the hashed password
            regno,
            image: imageUrl,
            resume: resumeUrl
        });

        await newStudent.save();

        // Generate a JWT token
        const token = jwt.sign(
            { userId: newStudent._id, email: newStudent.email },
            process.env.JWT_SECRET, // Ensure you have JWT_SECRET in your .env file
            { expiresIn: "1h" }
        );

        // Respond with success message and JWT token
        res.status(200).json({
            message: "Student profile uploaded and registered successfully",
            data: {
                name, email, number, degree, cgpa, skills, regno, image: imageUrl, resume: resumeUrl
            },
            token
        });
    } catch (error) {
        console.error("Error during student registration:", error);
        res.status(500).json({ error: "Student registration failed!" });
    }
});


router.post("/student-login", async (req, res) => {
  

    try {
        const user = await Student.findOne({ email: req.body.email });
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

router.get("/student-details", authMiddleware, async (req, res) => {
    try {
       
        // Assuming you want to fetch the student details from the database
        const studentDetails = await Student.findById(req.user.id); // req.user.id should be set by your authMiddleware
        if (!studentDetails) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json(studentDetails);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Error while fetching user data" });
    }
});

router.put("/student-update/:id", upload.fields([{ name: "image" }, { name: "resume" }]), async (req, res) => {
    const { id } = req.params; // Get the ID from the URL parameters
    const { name, email, number, degree, cgpa, skills, regno } = req.body;
    const image = req.files.image ? req.files.image[0] : null;
    const resume = req.files.resume ? req.files.resume[0] : null;

    try {
        // Find the student by ID
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ error: "Student not found!" });
        }

        // Update the fields
        student.name = name;
        student.email = email;
        student.number = number;
        student.degree = degree;
        student.cgpa = cgpa;
        student.skills = skills;
        student.regno = regno;

        // Check for image upload
        if (image) {
            // Upload new image to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(image.path, { resource_type: "image" });
            student.image = imageUpload.secure_url; // Update image URL
        }

        // Check for resume upload
        if (resume) {
            const resumeUrl = `files/${resume.filename}`; // Assuming you store resumes locally
            student.resume = resumeUrl; // Update resume URL
        }

        await student.save(); // Save updated student

        res.status(200).json({
            message: "Student profile updated successfully",
            student
        });
    } catch (error) {
        console.error("Error during student update:", error);
        res.status(500).json({ error: "Student update failed!" });
    }
});



export default router;
