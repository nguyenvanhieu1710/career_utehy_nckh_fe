import Link from "next/link";
// import Button from "@/components/ui/Button";
import { Facebook, Youtube, Mail, Phone } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Cột 1: Logo + Liên hệ */}
          <div className="space-y-6">
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold">CAREER</span>
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500" />
                Email: fit@utehy.edu.vn
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-500" />
                SĐT: 0123 456 789
              </p>
            </div>
          </div>

          {/* Cột 2: DÀNH CHO SINH VIÊN */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">DÀNH CHO SINH VIÊN</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/jobs" className="hover:text-green-400 transition">Việc làm</Link></li>
              <li><Link href="/cv" className="hover:text-green-400 transition">Tạo CV</Link></li>
              <li><Link href="/events" className="hover:text-green-400 transition">Công việc yêu thích</Link></li>
              <li><Link href="/events" className="hover:text-green-400 transition">Công việc đã ứng tuyển</Link></li>
            </ul>
          </div>

          {/* Cột 3: NGÀNH NGHỀ NỔI BẬT */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">NGÀNH NGHỀ NỔI BẬT</h4>
            <ul className="space-y-3 text-sm">
              <li>IT - Phần mềm</li>
              <li>Marketing - PR</li>
              <li>Ngân hàng / Tài chính</li>
              <li>Giáo dục - Đào tạo</li>
              <li>Y tế - Sức khỏe</li>
              <li>Nhân sự - Hành chính</li>
              <li>Truyền thông - Báo chí</li>
            </ul>
          </div>

          {/* Cột 4: DÀNH CHO NHÀ TUYỂN DỤNG */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">DÀNH CHO NHÀ TUYỂN DỤNG</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/employer/post" className="hover:text-green-400 transition">Đăng tin tuyển dụng</Link></li>
              <li><Link href="/employer/manage" className="hover:text-green-400 transition">Quản lý đơn hàng</Link></li>
              <li><Link href="/employer/cv" className="hover:text-green-400 transition">Tìm ứng viên</Link></li>
              <li><Link href="/employer/pricing" className="hover:text-green-400 transition">Báo cáo thống kê</Link></li>
            </ul>
          </div>
        </div>

        {/* Dòng đối tác */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-center text-sm mb-6 text-gray-400">
            Hệ thống nhằm giúp các trường đại học điều phối hoạt động kết nối và tuyển dụng giữa sinh viên với các doanh nghiệp...
          </p>

          {/* Logo đối tác */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <Image src="/partners/joboko.png" alt="JobOK" width={120} height={60} />
            <Image src="/partners/topcv.png" alt="TopCV" width={120} height={60} />
            <Image src="/partners/careerviet.png" alt="CareerViet" width={140} height={60} />
            <Image src="/partners/topdev.png" alt="TopDev" width={120} height={60} />
            <Image src="/partners/careerlink.png" alt="CareerLink" width={140} height={60} />
          </div>

          {/* Logo trường + Upload CV button */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-bachkhoa-hanoi.png"
                alt="ĐH Bách Khoa Hà Nội"
                width={80}
                height={80}
                className="rounded-lg"
              />
              <div className="text-sm">
                <p className="text-white font-medium">Trường Đại học Bách Khoa Hà Nội</p>
                <p className="text-gray-400">Khoa CNTT và Truyền thông</p>
              </div>
            </div>

            {/* Nút Upload CV - dùng đúng Button custom của bạn */}
            {/* <Button
              value="Upload CV"
              backgroundColor="#0C6A4E"
              color="white"
              height="48px"
              iconRight={<span className="ml-2">Upload</span>}
            /> */}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2025 Career UTEHY. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="https://facebook.com" className="hover:text-green-400">
              <Facebook className="h-6 w-6" />
            </Link>
            <Link href="https://youtube.com" className="hover:text-green-400">
              <Youtube className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}