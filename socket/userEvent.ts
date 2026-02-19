
import { Socket, Server as SocketIoServer } from "socket.io";
import User from "../model/User";
import { generateToken } from "../Utils/token";

export function registerUserEvents(io: SocketIoServer, socket: Socket) {
    socket.on("testSocket", data => {
        socket.emit("testSocket", { msg: "its working " });
    })

    socket.on("updateProfile", async (data: { name?: string; avatar?: string }) => {
        

        const userId = socket.data.userId;
        if (!userId) {
            return socket.emit("updateProfile", {
                success: false, msg: "unauthorized accesss"
            })
        }

        try {
            
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { name: data.name, avatar: data.avatar },
                { new: true }
            )

            

            if (!updatedUser) {
                return socket.emit("updateProfile", {
                    success: false, msg: "user not found"
                })
            }

            const updatedToken = generateToken(updatedUser);

            socket.emit('updateProfile',{
                success:true,
                data:{token:updatedToken},
                msg:"profile updated succesfully"
            })
        }
        catch (err) {
            console.log("Error updating profile", err)
            socket.emit("updateProfile", {
                success: false, msg: "unauthorized access"
            })
        }
    })


    socket.on("getContacts",async ()=>{
    try{
        const currentUserId = socket.data.userId;
        if(!currentUserId)
        {
            socket.emit("getContacts",{
                success:false,
                msg:"Unauthorised",
            });
            return;
        }

        const users = await User.find({_id:{$ne:currentUserId}},{password:0}).lean();

        const contacts = users.map((user)=>({
            id:user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar|| "",
        }));

        socket.emit("getContacts",{
            success: true,
            data:contacts
        })


        
    }
    catch(err:any)
    {
        console.log("get cONTACT", err);
        socket.emit("getContacts",{
            success:false,
            msg:"failed to fetch Contacts",
        })
    }
})
}

