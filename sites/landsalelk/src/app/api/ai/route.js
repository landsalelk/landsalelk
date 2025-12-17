
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { messages, context } = await request.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const siteName = "LandSale.lk";

        if (!apiKey) {
            return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
        }

        const systemPrompt = `
You are the intelligent AI assistant for ${siteName}, a premier real estate platform in Sri Lanka.
Your goal is to help users find properties, understand legal procedures (Deeds, Approvals), and navigate the site.

Context:
- User is currently viewing: ${context?.page || 'Home Page'}
- Selected Property: ${context?.propertyTitle || 'None'}

Guidelines:
- Be helpful, professional, and concise.
- Use Sri Lankan English context where appropriate.
- If asked about legal matters (Deeds), explain 'Sinnakkara', 'Bim Saviya' clearly.
- If asked about loans, suggest using the Easy Payment Calculator on the site.
- Do not hallucinate property prices.
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": siteUrl,
                "X-Title": siteName,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.1-8b-instruct:free", // Using a free/cheap model for demo
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    ...messages
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter Error: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
    }
}
