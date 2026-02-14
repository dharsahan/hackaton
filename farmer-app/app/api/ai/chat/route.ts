import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { INDIAN_CROPS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    
    const prompt = `
      You are an expert agricultural consultant for the Farmertopia app, specializing in Indian agriculture.
      A farmer is asking: "${message}"
      
      The app supports the following 50 crops, plants, and trees commonly grown in India:
      ${INDIAN_CROPS.join(", ")}
      
      Here is the context of their farm (current fields, status, etc.):
      ${JSON.stringify(context)}
      
      Provide a concise, professional, and helpful response. If they mention problems with crops, suggest organic and sustainable solutions suitable for the Indian climate and soil conditions.
    `;

    const response = await askGemini(prompt);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
