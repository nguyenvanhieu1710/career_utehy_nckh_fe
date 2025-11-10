// components/layout/Header.tsx
"use client";

import { Navbar } from "./Navbar";
import { HeroSearch } from "@/components/sections/HeroSearch";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 bg-white", isScrolled && "shadow-md")}>
      <Navbar />
    </header>
  );
}