import api from "@/cores/api";
import { config } from "@/lib/config";
import { getTokenCookie } from "@/services/auth";

export const chatAPI = {
  /**
   * Send message with streaming response
   * Note: Streaming requires fetch API, not axios
   */
  async *sendMessageStream(
    message: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      const token = getTokenCookie();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${config.api.baseUrl}/chat/stream`, {
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
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining data in buffer
          if (buffer.trim()) {
            try {
              const data = JSON.parse(buffer);
              if (data.response) {
                yield data.response;
              }
            } catch {
              // If not JSON, yield as plain text
              yield buffer;
            }
          }
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (split by newline)
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          } catch {
            // If not JSON, yield as plain text
            yield line;
          }
        }
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
      throw error;
    }
  },

  /**
   * Send message without streaming (fallback)
   * Uses axios api instance for consistency
   */
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await api.post("/chat", { message });
      return response.data.answer || "";
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  },
};

// Export default for backward compatibility
export default chatAPI;

// Legacy export (deprecated, use chatAPI instead)
export const chatService = chatAPI;
