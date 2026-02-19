import { Server as SocketIoServer, Socket, Server } from "socket.io";

import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import { registerUserEvents } from "./userEvent";
import { registerChatEvents } from "./chatEvents";
import Conversation from "../model/Conversation";

dotenv.config();

export function initializeSocket(server: any): SocketIoServer {
    const io = new SocketIoServer(server, {
        cors: {
            origin: "*",
        }
    })

    io.use((socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            console.log("bakcend reached");
            if (!token) {
                return next(new Error("Authatication error: No token provided"))
            }

            jwt.verify(
                token,
                process.env.JWT_SECERT as string,
                (err: any, decoded: any) => {
                    if (err) {
                        return next(new Error("Authatication error: invalid token provided"))
                    }

                    let userData = decoded.user;
                    socket.data = userData;
                    socket.data.userId = userData.id;
                    next();
                })
        }
        catch (err) {
            console.log("❌ backend auth failed");
            next(new Error("Invalid token"));
        }
    })




    io.on("connection", async (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`user connected : ${userId}, username: ${socket.data.name} `);

        registerUserEvents(io, socket);
        registerChatEvents(io, socket);

        try{
            const conversations = await Conversation.find({
                participants:userId
            }).select("_id");
            conversations.forEach(conversation=>{
                socket.join(conversation._id.toString());
            }
            )
        }
        catch(err)
        {
            console.log("Error Joining Conversation",err)
        }

        socket.on("disconnect", () => {
            console.log(`user disconnected: ${userId}`);
        })
    })

    return io;

}