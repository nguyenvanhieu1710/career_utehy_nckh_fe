// components/home/HotJobs.tsx
import SectionTitle from "@/components/common/SectionTitle";
import JobCard from "@/components/common/JobCard";
import PaginationArrows from "@/components/common/PaginationArrows";

const hotJobs = [
  {
    logo: "/logo/kyna-english.png",
    title: "Giáo viên Tiếng Anh online",
    company: "Công ty cổ phần Dream Viet Education - Kyna English",
    location: "Toàn quốc",
  },
  {
    logo: "/logo/mavin.jpg",
    title: "Chuyên viên Pháp chế",
    company: "Công ty cổ phần Tập đoàn Mavin",
    location: "Hà Nội",
  },
  {
    logo: "/logo/arian-holding.jpg",
    title: "Thực tập sinh Nhân sự",
    company: "Công ty cổ phần Bất động sản AsianHolding",
    location: "Hồ Chí Minh",
  },
  {
    logo: "/logo/avepoint.png",
    title: "Intern/Junior/Middle QA/Tester",
    company: "Công ty TNHH AvePoint",
    location: "Hà Nội, Đà Nẵng",
  },
  {
    logo: "/logo/x-media.png",
    title: "Chuyên viên tuyển dụng",
    company: "Công ty cổ phần X-Media",
    location: "",
  },
  {
    logo: "/logo/funtap.png",
    title: "Senior Unity Developer",
    company: "Công ty Cổ phần Funtap",
    location: "Hà Nội, Hải Phòng",
  },
];

export default function HotJobs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionTitle title="VIỆC LÀM HOT" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {hotJobs.map((job, index) => (
                <JobCard key={index} {...job} />
            ))}
            </div>

        <div className="flex justify-center mt-12">
          <PaginationArrows />
        </div>
      </div>
    </section>
  );
}