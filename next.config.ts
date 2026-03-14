import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      // Add more patterns for production if needed
      // {
      //   protocol: "https",
      //   hostname: "your-api-domain.com",
      //   pathname: "/uploads/**",
      // },
    ],
  },
  // Enable environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_STATIC_URL: process.env.NEXT_PUBLIC_STATIC_URL,
    NEXT_PUBLIC_CHATBOT_BASE_URL: process.env.NEXT_PUBLIC_CHATBOT_BASE_URL,
  },
};

export default nextConfig;
