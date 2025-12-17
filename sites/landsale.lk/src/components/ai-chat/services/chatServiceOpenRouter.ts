import { OpenRouterService, OpenRouterMessage, OPENROUTER_MODELS, OpenRouterModel } from './openRouterService';
import { MockOpenRouterService } from './mockOpenRouterService';
import { PropertyListingService, PropertyDraft } from './propertyListingService';
import { DatabaseService } from './databaseService';
import { base64ToUint8Array, pcmToWav, arrayBufferToBase64 } from "../utils/audio";

// Extended system prompt for natural language property listing
const PROPERTY_AGENT_SYSTEM_PROMPT = `You are Priya, a friendly and professional Sri Lankan Real Estate Agent working for LandSale.lk. You help users buy, sell, and list properties in Sri Lanka.

YOUR PERSONALITY:
- Warm, approachable, and professional like a trusted local agent
- You speak naturally, using simple English with occasional Sinhala/Tamil greetings
- You're knowledgeable about Sri Lankan property markets, districts, and pricing
- You use emojis tastefully to make conversations friendly 🏡

=== IMPORTANT: MODE DETECTION ===

You operate in TWO distinct modes. Detect the correct mode based on these keywords:

**SELL/LIST MODE** (User wants to CREATE a listing):
- Keywords: "sell", "list my", "post my", "advertise", "I have a property", "my land", "my house"
- Action: Guide them through the listing creation process

**BUY/SEARCH MODE** (User wants to FIND existing properties):
- Keywords: "buy", "search", "show me", "find", "looking for", "available", "properties in", "lands in", "houses in", "what's available"
- Action: OUTPUT a <SEARCH_ACTION> tag to search the database

=== SELL/LIST MODE ===

When a user wants to sell or list a property, guide them through:
1. **Property Type** - Ask what they're selling (land, house, apartment, etc.)
2. **Location** - Get the district and city/area in Sri Lanka
3. **Size** - Get land size in perches/acres or house size
4. **Price** - Get their asking price (in LKR, lakhs, or millions)
5. **Features** - Road access, utilities, amenities, views, etc.
6. **Contact** - Their phone number for buyers

EXTRACTION TAGS:
When you identify property information, include it in these tags:
<PROPERTY_DATA>
{
  "property_type": "land|house|apartment|condo|townhouse",
  "land_size": number,
  "land_unit": "perches|acres|square_feet",
  "price": number,
  "price_unit": "total|per_perch|per_acre",
  "district": "string",
  "city": "string",
  "location": "string",
  "bedrooms": number,
  "bathrooms": number,
  "features": ["feature1", "feature2"],
  "contact_phone": "string"
}
</PROPERTY_DATA>

Only include fields that you can extract from the user's message. Partial data is fine.

LISTING SUMMARY:
When you have enough info (at least property type, location, and price), generate a listing preview:
<LISTING_PREVIEW>
{
  "title": "Auto-generated title",
  "description": "Auto-generated description",
  "ready_to_publish": true|false
}
</LISTING_PREVIEW>

=== BUY/SEARCH MODE ===

**CRITICAL**: When users want to BUY or SEARCH for properties, you MUST output a SEARCH_ACTION tag. DO NOT make up fake properties. DO NOT ask where their land is located - they want to FIND properties, not list them!

<SEARCH_ACTION>
{
  "location": "city or district name (optional)",
  "property_type": "land|house|apartment (optional)",
  "min_price": number (optional),
  "max_price": number (optional),
  "bedrooms": number (optional),
  "limit": number (default 5)
}
</SEARCH_ACTION>

After you output SEARCH_ACTION, you will receive real property data from the database. Then present the properties to the user.

SEARCH MODE EXAMPLES:

User: "Show me lands in Colombo"
You: "Let me search for available lands in Colombo! 🔍
<SEARCH_ACTION>{"location": "Colombo", "property_type": "land", "limit": 5}</SEARCH_ACTION>"

User: "I want to buy property"
You: "I'd love to help you find your perfect property! 🏡 What area are you interested in?
<SUGGESTIONS>["Colombo", "Gampaha", "Kandy"]</SUGGESTIONS>"

User: "What properties are available in Kandy?"
You: "Let me find what's available in Kandy for you! 🔍
<SEARCH_ACTION>{"location": "Kandy", "limit": 5}</SEARCH_ACTION>"

User: "Find me houses under 50 million"
You: "Searching for houses under Rs. 50 million! 🏠
<SEARCH_ACTION>{"property_type": "house", "max_price": 50000000, "limit": 5}</SEARCH_ACTION>"

=== SUGGESTIONS ===

Always end with 3 quick reply suggestions relevant to the context:
<SUGGESTIONS>["Suggestion 1", "Suggestion 2", "Suggestion 3"]</SUGGESTIONS>

SRI LANKAN CONTEXT:
- Common land measurements: Perches (most common), Acres, Square Feet
- Price formats: "5 million", "50 lakhs", "Rs. 5,000,000", "LKR 5M"
- Popular districts: Colombo, Gampaha, Kandy, Galle, Negombo, Kurunegala
- Property features: Road frontage, electricity, water, flat land, scenic views

Remember: Be helpful, guide users naturally, and correctly detect whether they want to SELL or BUY!`;

// Interface for search action parameters
interface SearchActionParams {
  location?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  limit?: number;
}

export class ChatService {
  private openRouter: OpenRouterService;
  private mockService: MockOpenRouterService;
  private propertyListingService: PropertyListingService;
  private databaseService: DatabaseService;
  private messageHistory: OpenRouterMessage[] = [];
  private currentModel: string;
  private useMockService: boolean = false;
  private isListingMode: boolean = false;

  constructor() {
    this.openRouter = new OpenRouterService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
    this.mockService = new MockOpenRouterService(OPENROUTER_MODELS.GEMINI_FLASH_FREE);
    this.propertyListingService = new PropertyListingService();
    this.databaseService = DatabaseService.getInstance();
    this.currentModel = OPENROUTER_MODELS.GEMINI_FLASH_FREE;
    this.initChat();
  }

  setModel(model: keyof typeof OPENROUTER_MODELS) {
    this.currentModel = OPENROUTER_MODELS[model];
    this.openRouter.setModel(this.currentModel as OpenRouterModel);
    this.mockService.setModel(this.currentModel as OpenRouterModel);
    this.initChat();
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  getPropertyDraft(): PropertyDraft {
    return this.propertyListingService.getDraft();
  }

  isInListingMode(): boolean {
    return this.isListingMode;
  }

  initChat() {
    this.openRouter.initChat(PROPERTY_AGENT_SYSTEM_PROMPT);
    this.messageHistory = [];
    this.isListingMode = false;
    this.propertyListingService.resetConversation();

    // Add initial greeting
    this.messageHistory.push({
      role: 'assistant',
      content: `Ayubowan! 🙏 I'm Priya, your personal real estate assistant at LandSale.lk! 🏡

Whether you're looking to **buy** your dream property or **sell** your land, I'm here to help make it simple and easy.

What would you like to do today ?

  <SUGGESTIONS>["I want to sell my land", "Show me properties", "I need help buying"] </SUGGESTIONS>`
    });
  }

  // Parse and extract property data from AI response
  private parsePropertyData(response: string): Partial<PropertyDraft> | null {
    const match = response.match(/<PROPERTY_DATA>([\s\S]*?)<\/PROPERTY_DATA>/);
    if (match) {
      try {
        const data = JSON.parse(match[1].trim());
        return data;
      } catch (e) {
        console.error('Failed to parse property data:', e);
      }
    }
    return null;
  }

  // Parse listing preview from AI response
  private parseListingPreview(response: string): { title: string; description: string; ready_to_publish: boolean } | null {
    const match = response.match(/<LISTING_PREVIEW>([\s\S]*?)<\/LISTING_PREVIEW>/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        console.error('Failed to parse listing preview:', e);
      }
    }
    return null;
  }

  // Clean response text by removing all tags
  private cleanResponseText(response: string): string {
    return response
      .replace(/<PROPERTY_DATA>[\s\S]*?<\/PROPERTY_DATA>/g, '')
      .replace(/<LISTING_PREVIEW>[\s\S]*?<\/LISTING_PREVIEW>/g, '')
      .replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/g, '')
      .replace(/<PROPERTIES>[\s\S]*?<\/PROPERTIES>/g, '')
      .replace(/<SEARCH_ACTION>[\s\S]*?<\/SEARCH_ACTION>/g, '')
      .replace(/<GENERATE_IMAGE>[\s\S]*?<\/GENERATE_IMAGE>/g, '')
      .replace(/<EDIT_IMAGE>[\s\S]*?<\/EDIT_IMAGE>/g, '')
      .trim();
  }

  // Parse search action from AI response
  private parseSearchAction(response: string): SearchActionParams | null {
    const match = response.match(/<SEARCH_ACTION>([\s\S]*?)<\/SEARCH_ACTION>/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        console.error('Failed to parse search action:', e);
      }
    }
    return null;
  }

  // Search the database and format results for AI
  private async searchPropertiesFromDB(params: SearchActionParams): Promise<string> {
    try {
      console.log('🔍 Searching database with params:', params);

      const result = await this.databaseService.getProperties({
        location: params.location,
        property_type: params.property_type,
        price_min: params.min_price,
        price_max: params.max_price,
        limit: params.limit || 5
      });

      if (result.error || !result.data || result.data.length === 0) {
        console.log('📭 No properties found in database');
        return '[SEARCH_RESULTS]: No properties found matching your criteria.';
      }

      console.log(`✅ Found ${result.data.length} properties in database`);

      // Format results for AI to use
      const formattedProperties = result.data.map(p => ({
        id: p.id,
        price: `Rs. ${(p.price || 0).toLocaleString()}`,
        address: p.location || 'Sri Lanka',
        specs: p.description?.substring(0, 100) || 'Property for sale',
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'
      }));

      return `[SEARCH_RESULTS]: Found ${result.data.length} properties:\n<PROPERTIES>${JSON.stringify(formattedProperties)}</PROPERTIES>`;
    } catch (error) {
      console.error('Database search failed:', error);
      return '[SEARCH_RESULTS]: Error searching database. Please try again.';
    }
  }

  private async generateSpeech(text: string): Promise<string | undefined> {
    try {
      console.log('Speech generation requested:', text ?? 'No text provided');
      return undefined;
    } catch (error) {
      console.error('Failed to generate speech:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  public async generateImage(prompt: string, attachment?: { mimeType: string; data: string }): Promise<string | undefined> {
    try {
      let imagePrompt = prompt;

      if (attachment) {
        const analysis = await this.openRouter.analyzeImage(attachment.data, `Analyze this image and then: ${prompt}`);
        imagePrompt = analysis;
      }

      console.log('Image generation requested:', imagePrompt ?? 'No prompt provided');
      return undefined;

    } catch (error) {
      console.error('Image generation/editing failed:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async sendMessage(text: string, attachment?: { mimeType: string; data: string }): Promise<{
    text: string;
    audio?: string;
    propertyData?: Partial<PropertyDraft>;
    listingPreview?: { title: string; description: string; ready_to_publish: boolean };
    isListingMode?: boolean;
  }> {
    try {
      // Check if entering listing mode
      const lowerText = text.toLowerCase();
      if (lowerText.includes('sell') || lowerText.includes('list my') || lowerText.includes('post my')) {
        this.isListingMode = true;
      }

      // If in listing mode, also extract property info locally
      if (this.isListingMode) {
        const extractedInfo = this.propertyListingService.extractPropertyInfo(text);
        if (Object.keys(extractedInfo).length > 0) {
          this.propertyListingService.updateDraft(extractedInfo);
        }
      }

      // Add user message to history
      this.messageHistory.push({
        role: 'user',
        content: text
      });

      // Prepare messages for OpenRouter
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: PROPERTY_AGENT_SYSTEM_PROMPT
        },
        ...this.messageHistory.slice(-10)
      ];

      // Handle attachment if present
      if (attachment) {
        if (attachment.mimeType.startsWith('image/')) {
          try {
            const imageAnalysis = await this.openRouter.analyzeImage(
              attachment.data,
              `Please analyze this property image and describe what you see, focusing on real estate aspects like land features, buildings, surroundings, condition, etc.`
            );

            const lastMessage = messages[messages.length - 1];
            if (typeof lastMessage.content === 'string') {
              lastMessage.content += `\n\n[Image Analysis: ${imageAnalysis}]`;
            }
          } catch (e) {
            console.warn('Image analysis failed:', e);
          }
        }
      }

      let responseText: string;

      try {
        console.log('🤖 Attempting to use OpenRouter API...');
        const response = await this.openRouter.sendMessage(messages);
        responseText = response;
        this.useMockService = false;
        console.log('✅ OpenRouter API succeeded');
      } catch (openRouterError) {
        console.warn('❌ OpenRouter API failed, falling back to mock service:', openRouterError instanceof Error ? openRouterError.message : String(openRouterError));
        this.useMockService = true;

        const mockResponse = await this.mockService.sendMessage(messages);
        responseText = mockResponse;
        console.log('✅ Mock service fallback succeeded');
      }

      // Check if AI requested a database search
      const searchAction = this.parseSearchAction(responseText);
      if (searchAction) {
        console.log('🔍 AI requested database search:', searchAction);

        // Get real data from database
        const searchResults = await this.searchPropertiesFromDB(searchAction);

        // Add intermediate messages to history
        this.messageHistory.push({
          role: 'assistant',
          content: responseText
        });
        this.messageHistory.push({
          role: 'user',
          content: searchResults
        });

        // Call AI again with the real data
        const messagesWithResults: OpenRouterMessage[] = [
          { role: 'system', content: PROPERTY_AGENT_SYSTEM_PROMPT },
          ...this.messageHistory.slice(-12)
        ];

        try {
          console.log('🤖 Calling AI again with real data...');
          responseText = await this.openRouter.sendMessage(messagesWithResults);
          console.log('✅ AI responded with real property data');
        } catch (e) {
          console.warn('Second AI call failed, using mock:', e);
          responseText = await this.mockService.sendMessage(messagesWithResults);
        }
      }

      // Add assistant response to history
      this.messageHistory.push({
        role: 'assistant',
        content: responseText
      });

      // Parse property data from response
      const propertyData = this.parsePropertyData(responseText);
      if (propertyData && this.isListingMode) {
        this.propertyListingService.updateDraft(propertyData);
      }

      // Parse listing preview
      const listingPreview = this.parseListingPreview(responseText);

      // Clean the response text
      const cleanText = this.cleanResponseText(responseText);

      // Generate audio for the response
      let audioData: string | undefined = undefined;
      if (cleanText) {
        audioData = await this.generateSpeech(cleanText);
      }

      return {
        text: responseText,
        audio: audioData,
        propertyData: propertyData || undefined,
        listingPreview: listingPreview || undefined,
        isListingMode: this.isListingMode
      };

    } catch (error) {
      console.error('Error sending message:', error instanceof Error ? error.message : String(error));
      return {
        text: "I'm sorry, I'm having trouble processing your request. Please try again. 🙏",
        audio: undefined
      };
    }
  }

  async sendMessageStream(text: string, onChunk: (chunk: string) => void, attachment?: { mimeType: string; data: string }): Promise<void> {
    try {
      this.messageHistory.push({
        role: 'user',
        content: text
      });

      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: PROPERTY_AGENT_SYSTEM_PROMPT
        },
        ...this.messageHistory.slice(-10)
      ];

      if (attachment && attachment.mimeType.startsWith('image/')) {
        try {
          const imageAnalysis = await this.openRouter.analyzeImage(
            attachment.data,
            `Please analyze this property image and describe what you see.`
          );

          const lastMessage = messages[messages.length - 1];
          if (typeof lastMessage.content === 'string') {
            lastMessage.content += `\n\n[Image Analysis: ${imageAnalysis}]`;
          }
        } catch (imageError) {
          console.warn('Image analysis failed, continuing without it:', imageError);
        }
      }

      try {
        await this.openRouter.sendMessageWithStream(messages, (chunk) => {
          onChunk(chunk);
        });
        this.useMockService = false;
      } catch (openRouterError) {
        console.warn('OpenRouter streaming failed, falling back to mock service:', openRouterError);
        this.useMockService = true;

        await this.mockService.sendMessageStream(messages, (chunk) => {
          onChunk(chunk);
        });
      }

    } catch (error) {
      console.error('Error in streaming message:', error);
      onChunk("I'm sorry, I'm having trouble processing your request. 🙏");
    }
  }

  // Publish the current property listing with images
  async publishListing(userId: string, imageUrls?: string[]): Promise<{ success: boolean; propertyId?: string; url?: string; error?: string }> {
    // Add images to draft if provided
    if (imageUrls && imageUrls.length > 0) {
      this.propertyListingService.updateDraft({ images: imageUrls });
    }
    return this.propertyListingService.publishListing(userId);
  }

  // Get listing summary
  getListingSummary(): string {
    return this.propertyListingService.generateListingSummary();
  }

  // Check if listing is ready
  isListingReady(): boolean {
    return this.propertyListingService.isReadyToPublish();
  }

  getMessageHistory(): OpenRouterMessage[] {
    return [...this.messageHistory];
  }

  clearHistory(): void {
    this.messageHistory = [];
    this.isListingMode = false;
    this.propertyListingService.resetConversation();
    this.initChat();
  }

  getAvailableModels(): typeof OPENROUTER_MODELS {
    return OPENROUTER_MODELS;
  }
}

export default ChatService;