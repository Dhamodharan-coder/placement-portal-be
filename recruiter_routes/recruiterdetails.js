import express from "express";
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For JWT token generation
import dotenv from "dotenv";
import Recruiter from "../models/recruiter_profile.js";



const router = express.Router();

dotenv.config();


router.post("/recruiter-register",async (req,res)=>{
    const { name, email, password } = req.body;
    try {

         // Hash the password
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(password, saltRounds);

         const newRecruiter = new Recruiter({
            name,
            email,
            password: hashedPassword, // Save the hashed password
        });

        await newRecruiter.save();

        const token = jwt.sign(
            { userId: newRecruiter._id, email: newRecruiter.email },
            process.env.JWT_SECRET, // Ensure you have JWT_SECRET in your .env file
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Account registered successfully",
            data: {
                name, email
            },
            token
        });
        
    } catch (error) {
        console.error("Error during Recruiter registration:", error);
        res.status(500).json({ error: "Recruiter registration failed!" });
    }

})

router.post("/recruiter-login", async (req, res) => {
  

    try {
        const user = await Recruiter.findOne({ email: req.body.email });
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

export default router;
