// components/home/TopCompanies.tsx
import SectionTitle from "@/components/common/SectionTitle";
import CompanyCard from "@/components/common/CompanyCard";
import PaginationArrows from "@/components/common/PaginationArrows";

const companies = [
  {
    logo: "/mb-bank.png",
    name: "Ngân hàng TMCP Quân đội MB Bank - MB",
    jobsCount: 47,
  },
  {
    logo: "/fpt.jpg",
    name: "Công ty Cổ phần Viễn thông FPT Telecom - FPT",
    jobsCount: 112,
  },
  {
    logo: "/vus.png",
    name: "Anh văn Hội Việt Mỹ VUS Miền Bắc",
    jobsCount: 15,
  },
];

export default function TopCompanies() {
  return (
    <section className="py-16 bg-white">
      <div className="w-full px-6">
        <div className="flex justify-between items-center">
          <SectionTitle title="DOANH NGHIỆP HÀNG ĐẦU" />
          <PaginationArrows />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {companies.map((company) => (
            <CompanyCard key={company.name} {...company} />
          ))}
        </div>
      </div>
    </section>
  );
}
