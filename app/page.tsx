import { HeroSearch } from "@/components/sections/HeroSearch";
import TopCompanies from "@/components/home/TopCompanies";
import HotJobs from "@/components/home/HotJobs";
import TrendingIndustries from "@/components/home/TrendingIndustries";
import FeaturedJobs from "@/components/home/FeaturedJobs";
import TrustedSources from "@/components/home/TrustedSources";
import SystemIntro from "@/components/home/SystemIntro";

export default function Home() {
  return (
    <div>
      <main className="flex-1 bg-gray-50">
        <HeroSearch/>
        <TopCompanies/>
        <HotJobs/>
        <TrendingIndustries/>
        <FeaturedJobs/>
        <TrustedSources/>
        <SystemIntro/>
      </main>
    </div>
  );
}
