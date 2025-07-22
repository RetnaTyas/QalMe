import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  ai = null;

  initialize(apiKey) {
    if (!apiKey || !apiKey.startsWith('AIza')) {
        console.error("Invalid API Key provided for initialization.");
        throw new Error("Invalid API Key format.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  ensureInitialized() {
    if (!this.ai) {
      throw new Error("GeminiService not initialized. Call initialize(apiKey) first.");
    }
    return this.ai;
  }

  async generateSarcasticThought(prompt) {
    const ai = this.ensureInitialized();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{role: 'user', parts: [{text: prompt}]}],
        config: {
          temperature: 0.6,
          maxOutputTokens: 150,
        },
      });
      return response.text;
    } catch (error) {
      console.error('Error in generateSarcasticThought:', error);
      return "I'd make a sarcastic comment about this error, but I'm too busy being an error.";
    }
  }
  
  async generateContent(systemInstruction, prompt, tools) {
    const ai = this.ensureInitialized();
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    
    const config = {
      systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
      tools: tools,
      temperature: 0.7,
      topK: 40,
    };
    
    // @ts-ignore
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents, config });
    return response;
  }

  async generateJsonContent(systemInstruction, prompt, responseSchema) {
    const ai = this.ensureInitialized();
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    
    const config = {
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5
    };

    // @ts-ignore
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents, config });
    return response;
  }
}
