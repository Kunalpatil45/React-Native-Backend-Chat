
import { Request, Response } from "express"
import User from "../model/User.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../Utils/token.js";
import nodemailer from "nodemailer";


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    
    const { email, password, avatar, name } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        user = new User({
            email,
            password,
            avatar: avatar || "",
            name

        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        await user.save();

        const token = generateToken(user);

        res.json({
            success: true,
            token
        })
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration Failed' });
    }
}


export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email: email.toLowerCase() });
        

        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
}

export const forgetPassword = async (req: Request, res: Response) => {
 try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 1000 * 60 * 5);
        await user.save();

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: process.env.EMAIL_USER, pass: process.env.APP_PASS },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "password reset OTP",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });

        res.json({ success: true, message: "OTP sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const verifyOtp = async (req: Request, res: Response) => {
 try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ success: true, message: "OTP verified" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};