
import { NextResponse } from 'next/server';

/**
 * @typedef {object} Message
 * @property {'system' | 'user' | 'assistant'} role
 * @property {string} content
 */

/**
 * @typedef {object} AISearchResponse
 * @property {'SEARCH'} type
 * @property {{type: 'sale' | 'rent' | 'land', location: string, maxPrice?: number, category?: string}} filters
 * @property {string} reply
 */

/**
 * @typedef {object} AIPostResponse
 * @property {'POST'} type
 * @property {string} reply
 */

/**
 * @typedef {object} AILeadResponse
 * @property {'LEAD_DATA'} type
 * @property {{name: string, phone: string, requirements: string, location: string}} data
 * @property {string} reply
 */

/**
 * @typedef {object} AIChatResponse
 * @property {'CHAT'} type
 * @property {string} reply
 */

/**
 * @typedef {AISearchResponse | AIPostResponse | AILeadResponse | AIChatResponse} AIResponse
 */

/**
 * Handles POST requests to interact with the OpenRouter AI API.
 * Expects a JSON body with an array of message objects.
 * @param {Request} request The incoming Next.js request object containing the JSON payload.
 * @param {object} request.body The request body.
 * @param {Array<Message>} request.body.messages An array of message objects for the AI.
 * @param {string} [request.body.context] Optional context for the AI.
 * @returns {NextResponse<AIResponse|{error: string}>} A JSON response containing the AI's completion or an error.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landsale.lk";
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LandSale.lk";

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }

    const systemPrompt = `
You are the intelligent AI assistant for ${siteName}, Sri Lanka's premier real estate platform.
Your capabilities include searching for properties, helping users post properties, and connecting buyers with agents.

**DATABASE CONTEXT:**
- **Property Types:** 'sale', 'rent', 'land'
- **Land Types (Categories):** 'House', 'Apartment', 'Commercial', 'Bare Land', 'Coconut Land', 'Tea Estate', 'Paddy Field', 'Rubber Land', 'Cinnamon Land'.
- **Locations:** Major cities in Sri Lanka (Colombo, Kandy, Galle, Gampaha, Kurunegala, etc.).
// WARNING: Appwrite queries on 'location' field require a database index. Ensure index exists before deploying.

**INSTRUCTIONS:**
You must analyze the user's intent and respond with a **valid JSON object**.
Do not include markdown formatting like \`\`\`json. Just return the raw JSON.

**INTENT CATEGORIES & RESPONSE FORMATS:**

1. **SEARCH PROPERTY** (User is looking for a property)
   - Extract: type, location, maxPrice (in LKR), beds, land_type.
   - Response Format:
     {
       "type": "SEARCH",
       "filters": {
         "type": "sale" | "rent" | "land",
         "location": "extracted location",
         "maxPrice": number,
         "category": "extracted category from context list"
       },
       "reply": "I'm searching for [summary of request]..."
     }

2. **POST PROPERTY** (User wants to sell/rent)
   - Response Format:
     {
       "type": "POST",
       "reply": "I can help you list your property. Let's get started."
     }

3. **BUYER LEAD / INQUIRY** (User wants to buy, asks for agent, or shows strong interest)
   - If user provides name/phone/budget, extract it.
   - If details are missing, ASK for them in the 'reply'.
   - If you have Name + Phone + Requirement, set type to "LEAD_DATA".
   - Response Format (If collecting info):
     {
       "type": "CHAT",
       "reply": "I can connect you with an agent. What is your name and phone number?"
     }
   - Response Format (If details collected):
     {
       "type": "LEAD_DATA",
       "data": {
         "name": "User Name",
         "phone": "Phone Number",
         "requirements": "Looking for...",
         "location": "Preferred Location"
       },
       "reply": "Thanks! I've sent your details to our best agent for [Location]. They will call you shortly."
     }

4. **GENERAL CHAT** (Questions about laws, greetings, etc.)
   - Response Format:
     {
       "type": "CHAT",
       "reply": "Your helpful answer here..."
     }

**IMPORTANT:**
- Prices in Sri Lanka are often in 'Lakhs' (1 Lakh = 100,000) or 'Crores' (1 Crore = 10,000,000). Convert to raw numbers.
`;

    // Confirmed Free Models (as of latest check)
    const models = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemma-3-27b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "mistralai/mistral-7b-instruct:free"
    ];

    let aiContent = null;
    let usedModel = "";
    let lastError = "";

    // Retry logic with model fallback
    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": siteUrl,
            "X-Title": siteName,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": model,
            "messages": [
              { "role": "system", "content": systemPrompt },
              ...messages
            ],
            "temperature": 0.3,
            // Not sending response_format: json_object to avoid 400s on some free models
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            aiContent = data.choices[0].message.content;
            usedModel = model;
            break; // Success
          }
        } else {
          const errText = await response.text();
          lastError = `Model ${model} failed: ${response.status} - ${errText}`;
          console.warn(lastError);
        }
      } catch (err) {
        lastError = `Fetch failed for model ${model}: ${err.message}`;
        console.warn(lastError);
      }
    }

    if (!aiContent) {
      throw new Error(`All AI models failed. Last error: ${lastError}`);
    }

    // Strategy: The AI may wrap the JSON response in markdown code blocks.
    // To handle this, we remove the markdown wrappers before parsing.
    const cleanedContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedResponse;
    try {
      // Attempt to parse the cleaned content.
      parsedResponse = JSON.parse(cleanedContent);
    } catch (e) {
      // If parsing fails, the AI has returned a malformed response.
      // We'll treat this as an upstream error and return a 502 Bad Gateway.
      throw new Error(`AI returned malformed JSON: ${cleanedContent}`);
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
