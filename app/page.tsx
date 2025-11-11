import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSearch } from "@/components/sections/HeroSearch";
import TopCompanies from "@/components/home/TopCompanies";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="flex-1 bg-gray-50">
        <HeroSearch/>
        <TopCompanies/>
      </main>
      <Footer />
    </div>
  );
}
