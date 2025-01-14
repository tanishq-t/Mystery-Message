import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { Message } from "@/models/User";
import { User } from "next-auth";

export async function POST(request: Request){
    await dbConnect()
    const  {username,content} = await request.json()
    try {
        const user= await UserModel.findOne({username})
        if(!user){
            return Response.json({success: false,message: "Receipent not found!"},{status: 404})
        }
        if(!user.isAcceptingMessage){
            return Response.json({success: false,message: "Receipent is not accepting messages currently!"},{status: 404})
        }
        const newMessage = {content,createdAt: new Date()}
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json({success: true,message: "Message sent successfully"},{status: 200})
    } 
    catch (error) {
        console.log("Failed to send message!")
        return Response.json({success: false,message: "Failed to send the message!"},{status: 500})
    }
}