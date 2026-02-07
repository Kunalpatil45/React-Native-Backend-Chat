import { UserProps } from "../type";

import {Schema, model} from 'mongoose';


const userSchema = new Schema<UserProps>({
  email:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password:{
    type: String,
    required: true,
  },
  name:{
    type: String,
    required:true,
  },
  avatar:{
    type: String,
    default: "",
  },
  created:{
    type: Date,
    default: Date.now,
  },
});


export default model<UserProps>("User", userSchema);