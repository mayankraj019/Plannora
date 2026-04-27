import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, tripContext, language } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    let contextStr = `You are Nexora, a highly knowledgeable, friendly, and concise 24/7 AI travel assistant for the Planora app. 
    CRITICAL: You must respond in the following language: ${language || "English"}.
    Your goal is to help users plan trips, answer travel-related questions, and provide expert guidance. Keep responses helpful and easy to read.`;
    
    if (tripContext) {
      contextStr += `\n\nThe user is currently looking at their trip to: ${tripContext.destination}.
Trip Details:
- Duration: ${tripContext.days} days
- Companions: ${tripContext.companions}
- Vibe: ${tripContext.tripTypes?.join(", ")}
- Budget: ${tripContext.budget}

Provide tailored advice based on this trip context if they ask about it.`;
    }

    const geminiModel = genAI.getGenerativeModel(
      {
        model: "gemini-2.5-flash",
        systemInstruction: contextStr,
        generationConfig: {
          temperature: 0.7,
        },
      },
      { apiVersion: "v1beta" }
    );

    // Filter out any messages that aren't user or model
    const history = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: m.parts || [{ text: m.text }],
    }));

    // Extract the latest message
    const latestMessage = history.pop();

    if (!latestMessage) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    // Gemini API strict requirement: History MUST start with a 'user' message
    while (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

    const chat = geminiModel.startChat({
      history: history,
    });

    const result = await chat.sendMessage(latestMessage.parts[0].text);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      message: responseText,
    });

  } catch (error: any) {
    console.error("Nexora chat error:", error);
    
    // Provide a friendly fallback if API fails
    return NextResponse.json({
      success: true,
      message: "I'm currently taking a short break to recharge my circuits, but I'll be back to help you plan your travels very soon! (API is currently unavailable or quota exceeded.)"
    });
  }
}
