import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/APIresponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
) : Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mystery message | Verification Email',
            react: VerificationEmail({ username,otp: verifyCode }), 
        })

        return {success:true,message: 'Email Sent Successfully!'}
    } 
    catch (emailError) {
        console.error("Error sending verification email!",emailError)
        return {success: false,message: 'Failed to send the verification email'}
    }
}