import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSearch } from "@/components/sections/HeroSearch";

export default function Home() {
  return (
    <div>
      <main className="flex-1 bg-gray-50">
        <HeroSearch/>
      </main>
    </div>
  );
}
