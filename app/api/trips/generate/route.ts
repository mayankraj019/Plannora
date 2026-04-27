import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Dynamic currency fetch using RestCountries API
async function getCurrency(countryCode?: string): Promise<{ code: string; symbol: string }> {
  if (!countryCode) return { code: "USD", symbol: "$" };
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=currencies`);
    const data = await res.json();
    if (data && data.currencies) {
      const code = Object.keys(data.currencies)[0];
      const symbol = data.currencies[code].symbol || code;
      return { code, symbol };
    }
  } catch (e) {
    console.error("Currency fetch failed:", e);
  }
  return { code: "USD", symbol: "$" };
}

// Geocode a destination using MapTiler's Geocoding API
async function geocodeDestination(destination: string): Promise<{ lat: number; lng: number; name: string; countryCode?: string }> {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!maptilerKey) return { lat: 35.6762, lng: 139.6503, name: destination };

  try {
    const encoded = encodeURIComponent(destination);
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encoded}.json?key=${maptilerKey}&limit=1`
    );
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      let countryCode;
      if (data.features[0].context) {
        const countryFeature = data.features[0].context.find((c: any) => c.id.startsWith("country") || c.country_code);
        if (countryFeature) countryCode = countryFeature.country_code || countryFeature.short_code;
      }
      return { lat, lng, name: data.features[0].place_name || destination, countryCode };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return { lat: 35.6762, lng: 139.6503, name: destination };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { destination, days, companions, tripTypes, budget, preferences, language } = body;

  // Geocode destination early so both AI and fallback can use it
  const geo = await geocodeDestination(destination || "Paris, France");
  // Dynamically fetch actual local currency via RestCountries API using the country code
  const currency = await getCurrency(geo.countryCode);

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in your .env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel(
      {
        model: "gemini-1.5-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          topP: 0.8,
          maxOutputTokens: 8192,
        },
      },
      { apiVersion: "v1beta" }
    );

    // (currency already detected above)

    const prompt = `
You are Plannora's expert AI travel planner.

CRITICAL: EVERY SINGLE STRING VALUE IN THE JSON RESPONSE MUST BE IN THE TARGET LANGUAGE. 
NO ENGLISH ALLOWED EXCEPT FOR THE JSON KEYS THEMSELVES.

TARGET LANGUAGE: ${language || "English"}

CONTEXT & INSTRUCTIONS:
- Generate a detailed, practical, inspiring day-by-day travel itinerary.
- EVERYTHING (Trip Title, Summary, Highlights, Packing List, Activity Names, Activity Descriptions, Locations, Cuisine Types, Tips, etc.) MUST be in ${language || "English"}.
- If the language is an Indian regional language (Hindi, Marathi, Bengali, Tamil, etc.), use the correct script and ensure natural phrasing.
- Transliterate names of people or specific brands if they don't have a direct translation, but keep them in the target script (e.g., use Devanagari for Hindi).

Trip Details:
- Destination: ${destination} (approximate center coordinates: lat ${geo.lat.toFixed(4)}, lng ${geo.lng.toFixed(4)})
- Duration: ${days || 3} days
- Travel companions: ${companions}
- Trip vibe/type: ${tripTypes?.join(", ") || "General"}
- Budget tier: ${budget}
- Special preferences: ${JSON.stringify(preferences)}

IMPORTANT:
- All activity coordinates MUST be real, accurate coordinates near ${destination}.
- ALL monetary amounts MUST be in the LOCAL currency: ${currency.code} (${currency.symbol}).
- CRITICAL: Ensure the JSON is perfectly formatted. No trailing commas. No missing quotes.
- Keep descriptions concise to avoid truncation.

Return ONLY a valid JSON object:
{
  "tripTitle": "string (in ${language})",
  "summary": "string (in ${language})",
  "highlights": ["string (in ${language})"],
  "destinationCoordinates": { "lat": ${geo.lat}, "lng": ${geo.lng} },
  "estimatedTotalCost": {
    "min": number,
    "max": number,
    "currency": "${currency.code}",
    "currencySymbol": "${currency.symbol}",
    "breakdown": { 
      "accommodation": number, 
      "food": number, 
      "activities": number, 
      "transport": number 
    }
  },
  "recommendedRestaurants": [
    { 
      "name": "string (in ${language})", 
      "cuisine": "string (in ${language})", 
      "priceRange": "$|$$|$$$", 
      "location": "string (in ${language})",
      "coordinates": { "lat": number, "lng": number }
    }
  ],
  "bestTimeToVisit": "string (in ${language})",
  "packingEssentials": ["string (in ${language})"],
  "days": [
    {
      "dayNumber": number,
      "theme": "string (in ${language})",
      "activities": [
        {
          "time": "HH:MM",
          "name": "string (in ${language})",
          "location": "string (in ${language})",
          "coordinates": { "lat": number, "lng": number },
          "description": "string (in ${language})",
          "estimatedCost": "string (in ${language})",
          "category": "string (in ${language})",
          "transportToNext": { "mode": "string (in ${language})", "duration": "string (in ${language})" }
        }
      ]
    }
  ]
}
`;

    let result;
    let lastError;
    
    // Retry logic: Try up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        result = await geminiModel.generateContent(prompt);
        if (result) break;
      } catch (err) {
        lastError = err;
        console.warn(`AI attempt ${attempt + 1} failed:`, err);
        if (attempt === 0) await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
      }
    }

    if (!result) throw lastError || new Error("Failed after retries");

    const response = await result.response;
    const text = response.text();

    // Robust JSON extraction: find the first { and last } to ignore any AI conversational preamble
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("AI failed to provide a valid JSON structure:", text);
      throw new Error("Nexora could not build a valid itinerary structure. Please try again.");
    }
    const cleanJson = text.substring(jsonStart, jsonEnd + 1);
    
    const itinerary = JSON.parse(cleanJson);
    // Ensure destination coordinates are always set
    itinerary.destinationCoordinates = itinerary.destinationCoordinates || geo;
    // Ensure currency is always set from our detection
    if (itinerary.estimatedTotalCost) {
      itinerary.estimatedTotalCost.currency = itinerary.estimatedTotalCost.currency || currency.code;
      itinerary.estimatedTotalCost.currencySymbol = itinerary.estimatedTotalCost.currencySymbol || currency.symbol;
    }
    // Normalize restaurant priceRange: replace $ / $$ / $$$ with local currency symbol
    if (itinerary.recommendedRestaurants && currency.symbol !== "$") {
      itinerary.recommendedRestaurants = itinerary.recommendedRestaurants.map((r: any) => ({
        ...r,
        priceRange: r.priceRange?.replace(/\$/g, currency.symbol)
      }));
    }

    return NextResponse.json({ success: true, itinerary });
  } catch (error: any) {
    console.error("Gemini generation error:", error);

    // If quota exceeded or API unavailable, return a rich demo itinerary
    const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("404");

    if (isQuotaError) {
      return NextResponse.json({
        success: true,
        demo: true,
        itinerary: buildDemoItinerary(destination || "Paris, France", geo, days || 3, companions || "solo", budget || "mid-range", tripTypes || ["Culture"], currency, language),
      });
    }

    return NextResponse.json({ error: error.message || "Failed to generate itinerary" }, { status: 500 });
  }
}

function buildDemoItinerary(destination: string, geo: { lat: number; lng: number }, days: number, companions: string, budget: string, tripTypes: string[], currency: { code: string; symbol: string }, language?: string) {
  const lang = language?.toLowerCase() || "english";
  const isHindi = lang === "hindi";
  const isMarathi = lang === "marathi";
  
  const budgetMultiplier = budget === "luxury" ? 3 : budget === "budget" ? 0.5 : 1;
  const currencyScale: Record<string, number> = {
    INR: 80, JPY: 150, USD: 1, EUR: 0.92,
  };
  const scale = currencyScale[currency.code] || 1;
  const basePerDay = Math.round(150 * budgetMultiplier * scale);

  // Localization Maps
  const loc = {
    title: isHindi ? `${destination} की यात्रा` : isMarathi ? `${destination} सहल` : `${destination} Adventure`,
    summary: isHindi 
      ? `${destination} की एक अविश्वसनीय ${days} दिवसीय यात्रा, जो आपके लिए तैयार की गई है। (नोट: एआई अभी व्यस्त है, यह एक डेमो योजना है)`
      : isMarathi
      ? `${destination} ची एक अविश्वसनीय ${days} दिवसांची सहल, तुमच्यासाठी खास तयार केलेली. (टीप: AI सध्या व्यस्त आहे, ही एक नमुना योजना आहे)`
      : `An incredible ${days}-day journey through ${destination}. (Note: AI is busy, this is a demo)`,
    highlights: isHindi 
      ? [`${destination} के प्रमुख स्थलों का अन्वेषण करें`, "स्थानीय व्यंजनों का स्वाद लें", "सांस्कृतिक विरासत का अनुभव करें"]
      : isMarathi
      ? [`${destination} मधील प्रमुख ठिकाणांना भेट द्या`, "स्थानिक खाद्यपदार्थांचा आस्वाद घ्या", "सांस्कृतिक वारसा अनुभवा"]
      : ["Explore iconic landmarks", "Savor local cuisine", "Experience local culture"],
    packing: isHindi
      ? ["आरामदायक जूते", "पावर एडाप्टर", "हल्के कपड़े", "सनस्क्रीन"]
      : isMarathi
      ? ["आरामदायी शूज", "पॉवर अडॅप्टर", "हलके कपडे", "सनस्क्रीन"]
      : ["Comfortable shoes", "Power adapter", "Light layers", "Sunscreen"],
    dayTheme: isHindi ? "आगमन और अन्वेषण" : isMarathi ? "आगमन आणि शोध" : "Arrival & Discovery",
    act1Name: isHindi ? "शहर भ्रमण" : isMarathi ? "शहर दर्शन" : "City Walking Tour",
    act1Desc: isHindi ? "शहर के ऐतिहासिक केंद्र का भ्रमण।" : isMarathi ? "शहराच्या ऐतिहासिक भागाची सहल." : "Explore the historic center.",
    act2Name: isHindi ? "स्थानीय बाजार" : isMarathi ? "स्थानिक बाजार" : "Local Market",
    act2Desc: isHindi ? "प्रसिद्ध बाजारों में खरीदारी और स्ट्रीट फूड।" : isMarathi ? "प्रसिद्ध बाजारपेठेत खरेदी आणि स्ट्रीट फूड." : "Shopping and street food at famous markets.",
    categories: { culture: isHindi ? "संस्कृति" : isMarathi ? "संस्कृती" : "culture", food: isHindi ? "भोजन" : isMarathi ? "खाद्य" : "food" }
  };

  return {
    tripTitle: loc.title,
    summary: loc.summary,
    highlights: loc.highlights,
    destinationCoordinates: { lat: geo.lat, lng: geo.lng },
    estimatedTotalCost: {
      min: Math.round(basePerDay * days * 0.8),
      max: Math.round(basePerDay * days * 1.2),
      currency: currency.code,
      currencySymbol: currency.symbol,
      breakdown: {
        accommodation: Math.round(basePerDay * days * 0.4),
        food: Math.round(basePerDay * days * 0.25),
        activities: Math.round(basePerDay * days * 0.2),
        transport: Math.round(basePerDay * days * 0.1),
      }
    },
    recommendedRestaurants: [
      { 
        name: "Local Flavors", 
        cuisine: loc.categories.food, 
        priceRange: currency.symbol, 
        location: destination,
        coordinates: { lat: geo.lat + 0.003, lng: geo.lng - 0.002 }
      }
    ],
    bestTimeToVisit: isHindi ? "अक्टूबर से मार्च" : isMarathi ? "ऑक्टोबर ते मार्च" : "October to March",
    packingEssentials: loc.packing,
    days: Array.from({ length: days }, (_, i) => ({
      dayNumber: i + 1,
      theme: loc.dayTheme,
      activities: [
        {
          id: `demo_${i}_1`,
          time: "09:00",
          name: loc.act1Name,
          location: destination,
          coordinates: { lat: geo.lat + 0.001, lng: geo.lng + 0.001 },
          description: loc.act1Desc,
          estimatedCost: "₹500",
          category: loc.categories.culture,
          transportToNext: { mode: "Walk", duration: "10 min" }
        },
        {
          id: `demo_${i}_2`,
          time: "14:00",
          name: loc.act2Name,
          location: destination,
          coordinates: { lat: geo.lat - 0.002, lng: geo.lng + 0.002 },
          description: loc.act2Desc,
          estimatedCost: "₹1000",
          category: loc.categories.food,
          transportToNext: { mode: "Taxi", duration: "15 min" }
        }
      ]
    }))
  };
}
