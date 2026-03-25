import { Document, Types } from "mongoose";

export interface UserProps extends Document {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  otp?: string | null;
  otpExpire?: Date | null;
  isOtpVerified?: boolean;
  created?: Date;
}

export interface ConversationProps extends Document {
  _id: Types.ObjectId;
  type: "direct" | "group";
  name?: string;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
