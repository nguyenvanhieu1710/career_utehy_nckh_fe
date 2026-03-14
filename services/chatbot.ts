import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

export const chatAPI = {
  /**
   * Send message with streaming response
   */
  async *sendMessageStream(
    message: string,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const response = await fetch(`${config.chatbot.baseUrl}/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Directly decode and yield each chunk - no buffering
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          yield chunk;
        }
      }
    } catch (error) {
      logger.error("Chatbot stream error", error);
      throw error;
    }
  },
};
