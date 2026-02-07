import {UserProps} from "../type";

import jwt from "jsonwebtoken";

export const generateToken = (user:UserProps)=>{
    const payload = {
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            avatar:user.avatar
        }
    }
    return jwt.sign(payload ,process.env.JWT_SECERT as string, {
        expiresIn : '24h'
    })
}