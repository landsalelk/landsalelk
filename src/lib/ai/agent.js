import { z } from 'zod';
import { AI_CONFIG } from './config.js';
import { AIClient } from './client.js';

// Response Schemas
const SearchFilterSchema = z.object({
  type: z.enum(['sale', 'rent', 'land']).optional(),
  location: z.string().optional(),
  maxPrice: z.number().optional(),
  category: z.string().optional()
});

const LeadDataSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  requirements: z.string().optional(),
  location: z.string().optional()
});

export const AgentResponseSchema = z.object({
  type: z.enum(['SEARCH', 'POST', 'CHAT', 'LEAD_DATA']),
  reply: z.string(),
  filters: SearchFilterSchema.optional(),
  data: LeadDataSchema.optional()
});

export class RealEstateAgent {
  constructor(apiKey) {
    this.client = new AIClient(apiKey);
  }

  async processRequest(messages, context = {}) {
    // Incorporate context into system prompt if available
    let systemPrompt = AI_CONFIG.SYSTEM_PROMPT;

    if (context && Object.keys(context).length > 0) {
      const contextString = `
**CURRENT PAGE CONTEXT:**
- Page: ${context.page || 'Unknown'}
- Property Title: ${context.propertyTitle || 'Unknown'}
`;
      systemPrompt += contextString;
    }

    // Construct the full conversation history
    const conversation = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    try {
      const { content, model } = await this.client.completion(conversation);

      // Clean up markdown if present (handling "```json" or just "```")
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanContent);
      } catch (e) {
        console.warn("AI did not return valid JSON, using fallback.", content);
        // Fallback for non-JSON responses
        parsedResponse = { type: "CHAT", reply: content };
      }

      // Validate against schema
      const result = AgentResponseSchema.safeParse(parsedResponse);

      if (!result.success) {
        console.warn("Agent response validation failed:", result.error);
        // Best effort fallback
        return {
          type: "CHAT",
          reply: parsedResponse.reply || "I encountered an error processing your request."
        };
      }

      return result.data;

    } catch (error) {
      console.error("Agent Error:", error);
      throw error;
    }
  }
}
