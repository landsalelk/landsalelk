import { AI_CONFIG } from './config.js';

export class AIClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("OpenRouter API Key is required");
    }
    this.apiKey = apiKey;
  }

  async completion(messages) {
    let lastError = null;

    for (const model of AI_CONFIG.MODELS) {
      try {
        const response = await fetch(AI_CONFIG.BASE_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": AI_CONFIG.SITE_URL,
            "X-Title": AI_CONFIG.SITE_NAME,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": model,
            "messages": messages,
            "temperature": 0.3,
            // Not sending response_format: json_object to avoid 400s on some free models
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            return {
              content: data.choices[0].message.content,
              model: model
            };
          }
        } else {
          const errText = await response.text();
          lastError = `Model ${model} failed: ${response.status} - ${errText}`;
          console.warn(lastError);
        }
      } catch (err) {
        lastError = `Model ${model} error: ${err.message}`;
        console.warn(lastError);
      }
    }

    throw new Error(`All AI models failed. Last error: ${lastError}`);
  }
}
