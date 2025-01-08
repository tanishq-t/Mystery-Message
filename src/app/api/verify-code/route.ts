import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import {z} from "zod"; 

const otpSchema = z.object({
    username : usernameValidation,
    code : z.string().min(6,"verification code must be 6 digits")
})

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username,code}= await request.json()
        const result = otpSchema.safeParse({username,code})

        if(!result.success){
            const errors = (result.error.format().username?._errors && result.error.format().code?._errors) || []
            return Response.json({
                success: false,
                message: errors?.length>0 ? errors.join(', ') : "Invalid Query Parameters"
            },{status: 400})
        }

        const decodedUser = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUser})

        if(!user){
            return Response.json({success: false,message: "User not found"},{status:500})
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json({success: true,message: "Account verified Successfully"},{status:200})
        }
        else if(!isCodeNotExpired){
            return Response.json({success: false,message: "Verification Code Expired"},{status:400})
        }
        else{
            return Response.json({success: false,message: "Incorrect verification code"},{status:400})
        }

    } 
    catch (error) {
        console.error("Error verifying user",error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },
            {status : 500}
        )
    }
}