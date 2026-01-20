
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private chat: Chat | null = null;

  private getClient() {
    // Creating a fresh instance to ensure the most up-to-date API key is used
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public initChat(systemInstruction: string) {
    const ai = this.getClient();
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 1.0,
        topP: 0.95,
      },
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) throw new Error("Chat not initialized");
    const response = await this.chat.sendMessage({ message });
    return response.text || "দুঃখিত, আমি বুঝতে পারিনি।";
  }

  public async *sendMessageStream(message: string) {
    if (!this.chat) throw new Error("Chat not initialized");
    const result = await this.chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) yield c.text;
    }
  }

  public async connectLive(config: any) {
    const ai = this.getClient();
    return ai.live.connect(config);
  }
}

export const gemini = new GeminiService();
