
import { NextResponse } from 'next/server';

/**
 * @description Handles POST requests to the AI chat API endpoint.
 * This function acts as a proxy to the OpenRouter API. It includes a retry
 * mechanism with a fallback to different models if a request fails.
 * It specifically handles 401 Unauthorized errors to provide a clear
 * error message when the API key is invalid or missing.
 *
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response with the AI's reply or an error.
 */
export async function POST(request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }

    const { messages, context } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid 'messages' field. It must be a non-empty array." }, { status: 400 });
    }

    // Use OPENROUTER_API_KEY as discovered in environment
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landsale.lk";
    const siteName = "LandSale.lk";

    const systemPrompt = `
You are the intelligent AI assistant for ${siteName}, Sri Lanka's premier real estate platform.
Your capabilities include searching for properties, helping users post properties, and connecting buyers with agents.

**DATABASE CONTEXT:**
- **Property Types:** 'sale', 'rent', 'land'
- **Land Types (Categories):** 'House', 'Apartment', 'Commercial', 'Bare Land', 'Coconut Land', 'Tea Estate', 'Paddy Field', 'Rubber Land', 'Cinnamon Land'.
- **Locations:** Major cities in Sri Lanka (Colombo, Kandy, Galle, Gampaha, Kurunegala, etc.).

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

    // Truncate to prevent exceeding model token limits
    const truncatedMessages = messages.slice(-10);

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
              ...truncatedMessages
            ],
            "temperature": 0.3,
            // Not sending response_format: json_object to avoid 400s on some free models
          })
        });

        if (response.ok) {
          // 200 OK: The request was successful.
          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            aiContent = data.choices[0].message.content;
            usedModel = model;
            break; // Success: Exit the loop.
          }
        } else {
          let errText = 'Could not read error body';
          try {
            errText = await response.text();
          } catch (bodyReadError) {
            errText = `Failed to read body: ${bodyReadError.message}`;
          }

          if (response.status === 401) {
            // Break loop immediately as subsequent retries with the same invalid key are futile
            lastError = `[CRITICAL] Authentication failed for model ${model}: 401 Unauthorized. This is likely due to an invalid or missing OPENROUTER_API_KEY in your environment variables.`;
            // Break the loop immediately as all other models will fail with the same key.
            break;
          }
          lastError = `Model ${model} failed: ${response.status} - ${errText}`;
        }
      } catch (err) {
        lastError = `Network or fetch error for model ${model}: ${err.message}`;
      }
    }

    if (!aiContent) {
      return NextResponse.json({
        type: "CHAT",
        reply: `I apologize, but all our AI models failed to process your request. Last error: ${lastError}`
      }, { status: 500 });
    }

    // Clean up markdown if present
    aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiContent);
    } catch (e) {
      parsedResponse = { type: "CHAT", reply: aiContent };
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message
      : "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";

    return NextResponse.json({
      type: "CHAT",
      reply: errorMessage
    }, { status: 500 });
  }
}
