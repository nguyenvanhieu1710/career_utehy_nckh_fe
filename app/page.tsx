import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* <TopCompaniesSection />
        <HotJobsSection />
        <HotIndustriesSection />
        <FeaturedJobsSection />
        <PartnersSection />
        <UniversitySupportSection /> */}
      </main>
      <Footer />
    </div>
  );
}
