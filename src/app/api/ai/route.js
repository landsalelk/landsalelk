
import { NextResponse } from 'next/server';
import { RealEstateAgent } from '@/lib/ai/agent';

export async function POST(request) {
  try {
    const { messages, context } = await request.json();

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }

    const agent = new RealEstateAgent(apiKey);
    const response = await agent.processRequest(messages, context);

    return NextResponse.json(response);

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({
      type: "CHAT",
      reply: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
    });
  }
}
