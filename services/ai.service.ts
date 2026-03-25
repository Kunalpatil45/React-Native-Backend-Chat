import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔥 FIX 1: assert env variable
const apiKey = process.env.GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 🔥 FIX 2: add type to prompt
export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.log("AI Error:", error);
    return "AI is currently unavailable.";
  }
};