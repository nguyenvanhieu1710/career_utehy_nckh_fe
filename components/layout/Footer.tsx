import Link from "next/link";
import { Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          <div className="space-y-8">
            <div>
              <img src={"/logo/logo.jpg"} className="object-cover h-32" />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-[#1F407D]">LIÊN HỆ</h4>
                <div className="space-y-2 text-sm text-[#1F407D]">
                  <p className="flex items-center gap-3">
                    Email: fit@utehy.edu.vn
                  </p>
                  <p className="flex items-center gap-3">SĐT: 0123456789</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#1F407D] mb-3">
                  KẾT NỐI VỚI CHÚNG TÔI
                </h4>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h4 className="text-lg font-bold text-[#1F407D] mb-5 uppercase tracking-wider">
                DÀNH CHO SINH VIÊN
              </h4>
              <ul className="space-y-3 text-sm text-[#1F407D]/90">
                <li>
                  <Link href="/career/jobs" className="hover:text-blue-600 transition">
                    Việc làm
                  </Link>
                </li>
                <li>
                  <Link href="/cv" className="hover:text-blue-600 transition">
                    Tạo CV
                  </Link>
                </li>
                <li>
                  <Link href="/saved-jobs" className="hover:text-blue-600 transition">
                    Công việc yêu thích
                  </Link>
                </li>
                <li>
                  <Link href="/applied-jobs" className="hover:text-blue-600 transition">
                    Công việc đã ứng tuyển
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#1F407D] mb-5 uppercase tracking-wider">
                DÀNH CHO NHÀ TUYỂN DỤNG
              </h4>
              <ul className="space-y-3 text-sm text-[#1F407D]/90">
                <li>
                  <Link href="/employer/post-job" className="hover:text-blue-600 transition">
                    Đăng tin tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link href="/employer/dashboard" className="hover:text-blue-600 transition">
                    Quản lý danh mục
                  </Link>
                </li>
                <li>
                  <Link href="/employer/cv-search" className="hover:text-blue-600 transition">
                    Quản lý dữ liệu
                  </Link>
                </li>
                <li>
                  <Link href="/employer/reports" className="hover:text-blue-600 transition">
                    Báo cáo thống kê
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-[#1F407D] mb-5 uppercase tracking-wider">
              NGÀNH NGHỀ NỔI BẬT
            </h4>
            <ul className="space-y-3 text-sm text-[#1F407D]/90">
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Kinh doanh/ Bán hàng
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  IT - Phần mềm
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Marketing - PR
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Ngân hàng/ Tài chính
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Giáo dục - Đào tạo
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Y tế - Sức khỏe
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Nhà hàng - Khách sạn
                </Link>
              </li>
              <li>
                <Link href="/career/jobs" className="hover:text-blue-600 transition">
                  Truyền thông - Báo chí
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
