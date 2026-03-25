import { Server as SocketIoServer, Socket } from "socket.io";
import Conversation from "../model/Conversation.js";
import Message from "../model/Messages.js";
import { getAIResponse } from "../services/ai.service.js";



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

     const AI_USER_ID = process.env.GEMINI_USER_ID || "69c3a70f8e54ccc2b69a8782";
   socket.on("newMessage", async (data) => {
  console.log("newMessage event", data);

  try {
    const userId = socket.data.userId;

    const isAI = data.content?.toLowerCase().startsWith("@ai");

    let cleanContent = data.content;

    if (isAI) {
      cleanContent = data.content.replace(/@ai/i, "").trim();
    }

    // ✅ 1. CREATE USER MESSAGE
    const userMessage = await Message.create({
      conversationId: data.conversationId,
      senderId: userId,
      content: cleanContent || "",
      attachement: data.attachement || "",
      type: data.attachement ? "image" : "text",
    });

    // ✅ 2. POPULATE USER DATA
   const populatedUserMsg = await userMessage.populate("senderId", "name avatar") as any;

    // ✅ 3. EMIT USER MESSAGE
    io.to(data.conversationId).emit("newMessage", {
      success: true,
      data: {
        id: populatedUserMsg._id,
        content: populatedUserMsg.content,
        attachement: populatedUserMsg.attachement,
        type: populatedUserMsg.type,
        createdAt: populatedUserMsg.createdAt,
        conversationId: populatedUserMsg.conversationId,
        sender: {
          id: populatedUserMsg.senderId._id,
          name: populatedUserMsg.senderId.name,
          avatar: populatedUserMsg.senderId.avatar,
        },
      },
    });

    // 🔥 4. AI RESPONSE
    if (isAI && cleanContent) {
      io.to(data.conversationId).emit("aiTyping", true);

      const aiReply = await getAIResponse(cleanContent);

      const aiMessage = await Message.create({
        conversationId: data.conversationId,
        senderId: AI_USER_ID,
        content: aiReply,
        type: "ai",
      });

      // ✅ populate AI user
      const populatedAiMsg = await aiMessage.populate("senderId", "name avatar") as any;

      io.to(data.conversationId).emit("aiTyping", false);

      io.to(data.conversationId).emit("newMessage", {
        success: true,
        data: {
          id: populatedAiMsg._id,
          content: populatedAiMsg.content,
          type: populatedAiMsg.type,
          createdAt: populatedAiMsg.createdAt,
          conversationId: populatedAiMsg.conversationId,
          sender: {
            id: populatedAiMsg.senderId._id,
            name: populatedAiMsg.senderId.name,
            avatar: populatedAiMsg.senderId.avatar,
          },
        },
      });
    }

    // ✅ 5. UPDATE LAST MESSAGE
    await Conversation.findByIdAndUpdate(data.conversationId, {
      lastMessage: userMessage._id,
    });

  } catch (err) {
    console.log("newMessage error:", err);

    socket.emit("newMessage", {
      success: false,
      msg: "failed to send message",
    });
  }
});


    socket.on("getMessage", async (data: { conversationId: string }) => {
        console.log("newMessage event ", data);

        try {
            const messages = await Message.find({
                conversationId: data.conversationId,
            })
                .sort({ createdAt: 1 })
                .populate<{ senderId: { _id: string; name: string; avatar: string } }>({
                    path: "senderId",
                    select: "name avatar"
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