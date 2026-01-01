import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const getAIEmergencyResponse = async (userPrompt: string, firstAidContext: any[]) => {
  if (!API_KEY) return "API Key missing.";

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // SWITCH TO FLASH-LITE HERE
  // This model offers the most generous free-tier limits as of Dec 2025
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const systemPrompt = `You are an emergency medical assistant. Use this data: ${JSON.stringify(firstAidContext)}`;

  try {
    const result = await model.generateContent([systemPrompt, userPrompt]);
    return result.response.text();
  } catch (error: any) {
    if (error.message?.includes("429")) {
      return "The AI is currently busy. Please retry in a few seconds or use the manual guides below.";
    }
    return "Connection error. Please call 100/101.";
  }
};