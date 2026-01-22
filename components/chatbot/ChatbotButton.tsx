"use client";

import { MessageCircle } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useState, useEffect } from "react";

export function ChatbotButton() {
  const { isOpen, unreadCount, toggleChat } = useChatbot();
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  // Hide button when scrolled to top or when modals are open
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    const checkForModals = () => {
      // Hide when modals/dialogs are open
      const hasModal = document.querySelector(
        '[role="dialog"], .modal, [data-state="open"]',
      );
      const hasOverlay = document.querySelector(
        ".fixed.inset-0, [data-overlay]",
      );
      setShouldHide(!!(hasModal || hasOverlay));
    };

    window.addEventListener("scroll", handleScroll);

    // Check for modals periodically
    const modalChecker = setInterval(checkForModals, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(modalChecker);
    };
  }, []);

  if (isOpen || shouldHide) return null;

  return (
    <button
      onClick={toggleChat}
      className={`fixed w-14 h-14 bg-green-500 hover:bg-green-600 
                 text-white rounded-full shadow-lg flex items-center justify-center
                 transition-all duration-300 hover:scale-110 z-[1000]
                 focus:outline-none focus:ring-4 focus:ring-green-300 cursor-pointer
                 ${
                   isScrolled
                     ? "bottom-6 right-6"
                     : "bottom-20 right-6 md:bottom-6"
                 }`}
      aria-label="Mở chat hỗ trợ"
      title="Chat với chúng tôi"
    >
      <MessageCircle size={24} />

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white 
                     text-xs w-5 h-5 rounded-full flex items-center justify-center
                     font-bold animate-pulse"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
