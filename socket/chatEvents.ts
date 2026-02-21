import { Server as SocketIoServer, Socket } from "socket.io";
import Conversation from "../model/Conversation";

import Message from "../model/Messages";



export function registerChatEvents(io: SocketIoServer, socket: Socket) {
    socket.on("getConversation", async () => {
        

        try {
            const userId = socket.data.userId;
            
            if (!userId) {
                console.log("userID check ongoing")
                socket.emit("getConversation", {
                    success: false,
                    msg: "unauthorised"
                })
                return;
            }

            
            const conversation = await Conversation.find({
                participants: userId
            }).sort({ updatedAt: -1 })
                .populate({
                    path: "lastMessage",
                    select: "content senderId attachement createdAt"
                }).populate({
                    path: "participants",
                    select: "name email avatar"
                }).lean();
            console.log("done")
            socket.emit("getConversation", {
                success: true,
                data: conversation
            });
        }
        catch (err) {
            console.log("err aa gya ")
            socket.emit("getConversation", {
                success: false,
                msg: "failed to fetch conversation",
            })
        }
    })



    socket.on("newConversation", async (data) => {
        

        try {
            if (data.type == 'direct') {
                const existingConversation = await Conversation.findOne({
                    type: 'direct',
                    participants: { $all: data.participants, $size: 2 },
                }).populate({
                    path: "participants",
                    select: "name email avatar"
                }).lean();
                if (existingConversation) {
                    socket.emit("new Conversation", {
                        success: true,
                        data: { ...existingConversation, isNew: false }

                    });
                    return;
                }
            }

            const conversation = await Conversation.create({
                type: data.type,
                participants: data.participants,
                name: data.name || "",
                avatar: data.avatar || "",
                createdBy: socket.data.userId,
            })
            const connectedSocket = Array.from(io.sockets.sockets.values()).filter(s => data.participants.includes(s.data.userId))

            connectedSocket.forEach((participantSocket) => {
                participantSocket.join(conversation._id.toString());
            });

            const populatedConversation = await Conversation.findById(conversation._id)
                .populate({
                    path: "participants",
                    select: "name email avatar"
                }).lean();

            if (!populatedConversation) {
                throw new Error("failed to populate conversation");
            }

            io.to(conversation._id.toString()).emit("newConversation", {
                success: true,
                data: { ...populatedConversation, isNew: true }
            });

        }
        catch (err) {
            console.log("newConversation err ", data);
            socket.emit("new Conversation", {
                success: false,
                msg: "failed to create conversation",
            })
        }
    });

    socket.on("newMessage", async (data) => {
        console.log("newMessage event ", data);

        try {
            const message = await Message.create({
                conversationId: data.conversationId,
                senderId: data.sender.id,
                content: data.content,
                attachement: data.attachement,
            })

            io.to(data.conversationId).emit("newMessage", {
                success: true,
                data: {
                    id: message._id,
                    content: data.content,
                    sender: {
                        id: data.sender.id,
                        name: data.sender.name,
                        avatar: data.sender.avatar,
                    },
                    attachement: data.attachement || null,
                    createdAt: new Date().toISOString(),
                    conversationId: data.conversationId,
                }
            });

            await Conversation.findByIdAndUpdate(data.conversationId, {
                lastMessage: message._id,
            })

        } catch (err) {
            console.log("newMessage err ", err);
            socket.emit("newMessage", {
                success: false,
                msg: "failed to send message",
            })
        }
    })


    socket.on("getMessage", async (data: { conversationId: string }) => {
        console.log("newMessage event ", data);

        try {
            const messages = await Message.find({
                conversationId: data.conversationId,
            })
            .sort({ createdAt: 1 })
            .populate<{senderId: {_id:string; name:string; avatar:string}}>({
                path:"senderId",
                select:"name avatar"
            }).lean();

            const messageWithSender = messages.map(message => ({
                ...message,
                id: message._id,
                sender: {
                    id: message.senderId._id,
                    name: message.senderId.name,
                    avatar: message.senderId.avatar,
                }
            }))
            socket.emit("getMessage", {
                success: true,
                data: messageWithSender,
            })
        }
         catch (err) {
            console.log("getMessage err ", err);
            socket.emit("getMessage", {
                success: false,
                msg: "failed to fetch message",
            })
        }
    })
}