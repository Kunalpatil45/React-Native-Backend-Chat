import { Server as SocketIoServer, Socket } from "socket.io";
import Conversation from "../model/Conversation";
import { i } from "vite/dist/node/chunks/moduleRunnerTransport";


export function registerChatEvents(io: SocketIoServer, socket: Socket) {
    socket.on("getConversation",async ()=>{
        console.log("getConversation")

        try{
            const userId = socket.data.userId;
            console.log("going to check userId now")
            if(!userId)
            {
                console.log("userID check ongoing")
                socket.emit("getConversation",{
                    success:false,
                    msg:"unauthorised"
                })
                return;
            }

            console.log("going to checking done")
            const conversation = await Conversation.find({
                participants:userId
            }).sort({updatedAt: -1})
            .populate({
                path:"lastMessage",
                select: "content senderId attachement createdAt"
            }).populate({
                    path: "participants",
                    select: "name email avatar"
                }).lean();
                console.log("done")
            socket.emit("getConversation",{
                    success:true,
                    data:conversation
                });
        }
        catch(err)
        {
            console.log("err aa gya ")
            socket.emit("getConversation", {
                success: false,
                msg: "failed to fetch conversation",
            })
        }
    })



    socket.on("newConversation", async (data) => {
        console.log("newConversation event ", data);

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

                if(!populatedConversation)
                {
                    throw new Error("failed to populate conversation");
                }

                io.to(conversation._id.toString()).emit("newConversation",{
                    success:true,
                    data:{...populatedConversation,isNew:true}
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
}