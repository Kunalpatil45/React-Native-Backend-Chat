
import { UserProps } from "../type.js";
import mongoose, { model } from "mongoose";



  const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  avatar: String,
  otp: String,
  otpExpire: Date,
  isOtpVerified: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});


export default model<UserProps>("User", userSchema);