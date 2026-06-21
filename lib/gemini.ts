import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI?.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.8,
    topP: 0.9,
    maxOutputTokens: 8192,
  },
});
