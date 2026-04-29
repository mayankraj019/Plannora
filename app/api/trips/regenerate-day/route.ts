import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { destination, dayNumber, budget, tripTypes, companions, geo, currency, previousTheme, language } = body;

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel(
      {
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              dayNumber: { type: SchemaType.NUMBER },
              theme: { type: SchemaType.STRING },
              weatherNote: { type: SchemaType.STRING },
              meals: {
                type: SchemaType.OBJECT,
                properties: {
                  breakfast: {
                    type: SchemaType.OBJECT,
                    properties: { suggestion: { type: SchemaType.STRING }, estimatedCost: { type: SchemaType.STRING } },
                    required: ["suggestion", "estimatedCost"]
                  },
                  lunch: {
                    type: SchemaType.OBJECT,
                    properties: { suggestion: { type: SchemaType.STRING }, estimatedCost: { type: SchemaType.STRING } },
                    required: ["suggestion", "estimatedCost"]
                  },
                  dinner: {
                    type: SchemaType.OBJECT,
                    properties: { suggestion: { type: SchemaType.STRING }, estimatedCost: { type: SchemaType.STRING } },
                    required: ["suggestion", "estimatedCost"]
                  }
                },
                required: ["breakfast", "lunch", "dinner"]
              },
              activities: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    id: { type: SchemaType.STRING },
                    time: { type: SchemaType.STRING },
                    period: { type: SchemaType.STRING },
                    name: { type: SchemaType.STRING },
                    location: { type: SchemaType.STRING },
                    coordinates: {
                      type: SchemaType.OBJECT,
                      properties: { lat: { type: SchemaType.NUMBER }, lng: { type: SchemaType.NUMBER } },
                      required: ["lat", "lng"]
                    },
                    duration: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    estimatedCost: {
                      type: SchemaType.OBJECT,
                      properties: { amount: { type: SchemaType.NUMBER }, currency: { type: SchemaType.STRING }, note: { type: SchemaType.STRING } },
                      required: ["amount", "currency", "note"]
                    },
                    category: { type: SchemaType.STRING },
                    tips: { type: SchemaType.STRING },
                    bookingRequired: { type: SchemaType.BOOLEAN },
                    transportToNext: {
                      type: SchemaType.OBJECT,
                      properties: { mode: { type: SchemaType.STRING }, duration: { type: SchemaType.STRING }, cost: { type: SchemaType.STRING }, instructions: { type: SchemaType.STRING } },
                      required: ["mode", "duration", "cost", "instructions"]
                    }
                  },
                  required: ["id", "time", "period", "name", "location", "coordinates", "duration", "description", "estimatedCost", "category", "tips", "bookingRequired", "transportToNext"]
                }
              }
            },
            required: ["dayNumber", "theme", "weatherNote", "meals", "activities"]
          },
          temperature: 0.9, // higher temp for more variety
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      },
      { apiVersion: "v1beta" }
    );

    const prompt = `
You are Plannora's expert AI travel planner. Generate a NEW, ALTERNATIVE day plan for a trip.

CRITICAL: EVERY SINGLE STRING VALUE IN THE JSON RESPONSE MUST BE IN THE TARGET LANGUAGE. 
NO ENGLISH ALLOWED EXCEPT FOR THE JSON KEYS.

TARGET LANGUAGE: ${language || "English"}

CONTEXT:
- Destination: ${destination}
- Day Number: ${dayNumber}
- ALL names, themes, descriptions, meals, and instructions MUST be in ${language || "English"}.
- Transliterate specific names into the target script (e.g. Devanagari for Hindi).

Context:
- Destination: ${destination} (approximate center: lat ${geo?.lat}, lng ${geo?.lng})
- Day Number: ${dayNumber}
- Travel companions: ${companions}
- Trip vibe: ${tripTypes?.join(", ")}
- Budget tier: ${budget}
- Previous theme we are replacing: "${previousTheme}"

IMPORTANT RULES:
- Create a COMPLETELY DIFFERENT theme and set of activities than the previous theme.
- All activity coordinates MUST be real, accurate coordinates near ${destination}.
- Use local currency: ${currency?.code} (symbol: ${currency?.symbol})
- Ensure meals and activities fit the budget.

Return ONLY a valid JSON object with this exact structure (a single day object):
{
  "dayNumber": ${dayNumber},
  "theme": "string — exciting new theme for the day",
  "weatherNote": "Expected weather",
  "meals": {
    "breakfast": { "suggestion": "restaurant name or type", "estimatedCost": "cost" },
    "lunch": { "suggestion": "restaurant name or type", "estimatedCost": "cost" },
    "dinner": { "suggestion": "restaurant name or type", "estimatedCost": "cost" }
  },
  "activities": [
    {
      "id": "act_new_1",
      "time": "09:00",
      "period": "morning",
      "name": "Activity name",
      "location": "Specific location, City",
      "coordinates": { "lat": number, "lng": number },
      "duration": "2 hours",
      "description": "2-3 vivid sentences",
      "estimatedCost": { "amount": 0, "currency": "${currency?.code}", "note": "price" },
      "category": "culture | food | nature | adventure | shopping | relaxation",
      "tips": "One insider tip",
      "bookingRequired": false,
      "transportToNext": {
        "mode": "walk | subway | bus | taxi",
        "duration": "10 min",
        "cost": "$0",
        "instructions": "Brief directions"
      }
    }
  ]
}
`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    
    // Robust JSON extraction
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid response format from AI.");
    }
    const cleanJson = text.substring(jsonStart, jsonEnd + 1);

    const newDay = JSON.parse(cleanJson);
    return NextResponse.json({ success: true, day: newDay });
  } catch (error: any  ) {
    console.error("Gemini regenerate day error:", error);

    // Provide a rich demo fallback
    return NextResponse.json({
      success: true,
      demo: true,
      day: buildDemoAlternativeDay(destination, dayNumber, geo, budget, currency),
    });
  }
}

function buildDemoAlternativeDay(destination: string, dayNumber: number, geo: any  , budget: string, currency: any  ) {
  const isLux = budget === "luxury";
  const sym = currency?.symbol || "$";
  return {
    dayNumber,
    theme: "Alternative Discovery & Hidden Gems",
    weatherNote: "Sunny intervals",
    meals: {
      breakfast: { suggestion: "Local Corner Café", estimatedCost: `${sym}10-${sym}15` },
      lunch: { suggestion: "Boutique Bistro", estimatedCost: `${sym}20-${sym}40` },
      dinner: { suggestion: isLux ? "Rooftop Fine Dining" : "Neighborhood Tavern", estimatedCost: `${sym}30-${sym}80` },
    },
    activities: [
      {
        id: `act_${dayNumber}_alt_1`,
        time: "10:00",
        period: "morning",
        name: "Secret Gardens & Alleys Tour",
        location: `Historic Outskirts, ${destination}`,
        coordinates: { lat: geo?.lat + 0.005, lng: geo?.lng - 0.005 },
        duration: "2.5 hours",
        description: `Explore the lesser-known side of ${destination}, wandering through quiet historic alleys, discovering street art, and visiting tranquil gardens away from the tourist crowds.`,
        estimatedCost: { amount: 15, currency: currency?.code || "USD", note: `~${sym}15 entry` },
        category: "culture",
        tips: "Bring your camera, this area is highly photogenic.",
        bookingRequired: false,
        transportToNext: { mode: "walk", duration: "15 min", cost: "0", instructions: "Walk east towards the artisan district." }
      },
      {
        id: `act_${dayNumber}_alt_2`,
        time: "14:00",
        period: "afternoon",
        name: "Artisan Craft Workshop",
        location: `Artisan Quarter, ${destination}`,
        coordinates: { lat: geo?.lat + 0.006, lng: geo?.lng - 0.003 },
        duration: "2 hours",
        description: `Get hands-on with a local master artisan. Learn the traditional techniques behind the region's famous crafts and take home your own handmade souvenir.`,
        estimatedCost: { amount: 45, currency: currency?.code || "USD", note: `~${sym}45 workshop fee` },
        category: "culture",
        tips: "You can ship your creation home if it's too large for your luggage.",
        bookingRequired: true,
        transportToNext: { mode: "taxi", duration: "20 min", cost: `${sym}12`, instructions: "Catch a cab to the sunset viewpoint." }
      },
      {
        id: `act_${dayNumber}_alt_3`,
        time: "17:30",
        period: "evening",
        name: "Panoramic Sunset Views",
        location: `High Viewpoint, ${destination}`,
        coordinates: { lat: geo?.lat - 0.008, lng: geo?.lng + 0.002 },
        duration: "1.5 hours",
        description: `End your day at one of the highest points in the city. Watch the sunset cast a golden glow over ${destination} while enjoying a locally crafted beverage.`,
        estimatedCost: { amount: 0, currency: currency?.code || "USD", note: "Free entry" },
        category: "nature",
        tips: "Arrive 45 minutes before sunset to secure a good spot.",
        bookingRequired: false,
        transportToNext: { mode: "subway", duration: "25 min", cost: `${sym}3`, instructions: "Take the scenic funicular down to the dinner spot." }
      }
    ]
  };
}
