import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { User } from "next-auth";

export async function POST(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User=session?.user as User

    if(!session || !session.user){
        return Response.json({success: false,message: "Not Authenticated!"},{status: 401}) 
    }

    const userId = user._id
    const {acceptMessages} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId,{isAcceptingMessage:true},{new:true})
        if(!updatedUser){
            return Response.json({success: false,message: "Failed to update user status!"},{status: 401}) 
        }

        return Response.json({success: true,message: "User Status updated successfully",updatedUser},{status: 200}) 
    } 
    catch (error) {
        console.log("Failed to change the user status!")
        return Response.json({success: false,message:"Failed to change the user status!" },{status:500})
    }
}

export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User=session?.user as User

    if(!session || !session.user){
        return Response.json({success: false,message: "Not Authenticated!"},{status: 401}) 
    }

    const userId = user._id
    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json({success: false,message: "Unable to find the user"},{status: 404})
        }
        return Response.json({success: true,message: "user status fetched successfully",isAcceptingMessage: foundUser.isAcceptingMessage},{status: 401})
    } 
    catch (error) {
        console.log("Failed to get user status!")
        return Response.json({success: false,message: "Failed to update user status"},{status: 500})
    }
}