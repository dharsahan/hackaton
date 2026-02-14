import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function askGemini(prompt: string) {
  if (!apiKey) {
    return "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.";
  }
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now.";
  }
}
