
import {Request , Response } from "express"
import User from "../model/User"
import bcrypt from "bcryptjs";
import { generateToken } from "../Utils/token";


export const registerUser = async (req:Request, res:Response): Promise<void> => {
    const { email, password , avatar , name } = req.body;
    try{
        let user =  await User.findOne({ email });
        if(user){
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        user = new User({ 
            email, 
            password, 
            avatar : avatar ||  "", 
            name 

        });

        const salt = await bcrypt.genSalt(10);
        user.password =  await bcrypt.hash(password , salt);


        await user.save();

        const token = generateToken(user);

        res.json({
            success: true,
            token
        })
    }
    catch(error){
        console.error('Registration error:', error);
        res.status(500).json({ success:false, message: 'Registration Failed' });
    }
}


export const loginUser = async (req:Request, res:Response): Promise<void> => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({email});
        if(!user)
        {
            res.status(400).json({
                succes: false,
                message : "User Already Exist!!"
            })
            return;
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch)
        {
            res.status(400).json({
                succes: false,
                message : "User Already Exist!!"
            })
            return;
        }

        const token = generateToken(user);
        res.json({
            success: true,
            token,
        })

    }
    catch(error){
        console.error('Registration error:', error);
        res.status(500).json({ success:false, message: 'Registration Failed' });
    }
}
