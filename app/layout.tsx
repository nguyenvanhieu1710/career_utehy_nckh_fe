import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_providers/providers";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career UTEHY NCKH",
  description: "Career UTEHY NCKH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          <div className="fixed top-4 right-4 z-50">
            <Toaster richColors position="top-right" />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
