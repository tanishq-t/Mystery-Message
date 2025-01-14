import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


export async function POST(request: Request){
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."
        
        const result = await model.generateContentStream(prompt);
        const stream = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of result.stream) {
                  controller.enqueue(new TextEncoder().encode(chunk.text()));
                }
                controller.close();
              } catch (error) {
                controller.error(error);
              }
            },
          });
      
        return new NextResponse(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
            },
        });
    } 
    catch (error) {
        console.error("Error in AI stream",error);
        return NextResponse.json({error: "Internal Server Error"},{status: 500})
    }
}