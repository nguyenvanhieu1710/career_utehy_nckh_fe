import { HeroSearch } from "@/components/home/HeroSearch";
import SuitableJobs from "@/components/home/SuitableJobs";
import TopCompanies from "@/components/home/TopCompanies";
import HotJobs from "@/components/home/HotJobs";
import TrendingIndustries from "@/components/home/TrendingIndustries";
import FeaturedJobs from "@/components/home/FeaturedJobs";
import TrustedSources from "@/components/home/TrustedSources";
import SystemIntro from "@/components/home/SystemIntro";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div>
      <main className="flex-1 bg-gray-50">
        <Header />
        <HeroSearch />
        <SuitableJobs />
        <TopCompanies />
        <HotJobs />
        <TrendingIndustries />
        <FeaturedJobs />
        <TrustedSources />
        <SystemIntro />
        <Footer />
      </main>
    </div>
  );
}
