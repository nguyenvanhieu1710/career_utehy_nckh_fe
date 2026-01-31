import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_providers/providers";
import { Toaster } from "sonner";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export const metadata: Metadata = {
  title: "Career UTEHY",
  description: "Career UTEHY",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <ChatbotProvider>
            <div className="fixed top-4 right-4 z-50">
              <Toaster richColors position="top-right" />
            </div>
            {children}
            <ChatbotWidget />
          </ChatbotProvider>
        </Providers>
      </body>
    </html>
  );
}
