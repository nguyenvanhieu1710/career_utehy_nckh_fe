"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Target, Heart, BookOpen } from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";

// Framer Motion variants used across the page
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statItem = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

interface StatCardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
}

const StatCard = ({ icon, number, label }: StatCardProps) => {
  return (
    <motion.div
      variants={statItem}
      initial="hidden"
      whileInView="show"
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="text-4xl mb-3 text-white">{icon}</div>
      <div className="text-3xl font-bold text-white mb-2">{number}</div>
      <p className="text-gray-200 text-center text-sm">{label}</p>
    </motion.div>
  );
};

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-5 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-green-700 mb-6"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              CAREER
            </motion.h1>
            <p className="text-xl text-gray-600 mb-8">
              --- Khởi đầu sự nghiệp vững chắc ---
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="/about-us/img-1.png"
                alt="Career Platform"
                width={400}
                height={400}
                className="drop-shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                WE ARE CAREER
              </h2>
              <p className="text-gray-700 leading-relaxed text-justify">
                Career là nền tảng kết nối việc làm và thực tập hằng ngày, được
                xây dựng riêng cho sinh viên. Với sự hỗ trợ của AI và Big Data,
                chúng tôi cam kết trở thành câu nối hiệu quả nhất giúp bạn tìm
                thấy những cơ hội phù hợp nhất, đáng tin cậy và có giá trị phát
                triển cao.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-[#FFD666] rounded-lg flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                TẦM NHÌN
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                Trở thành đơn vị cung cấp giải pháp công nghệ giúp kết nối người
                nhân lực hạng đặc biệt tại Việt Nam
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-[#FF7875] rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                SỨ MỆNH
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                Kết nối, nâng cao chất lượng nguồn nhân lực cho các trường lão
                động giúp các doanh nghiệp Việt Nam phát triển bền vững
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pt-20 pb-5 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle title="CÙNG CAREER PHÁT TRIỂN NGHỀ NGHIỆP" />

          <p className="text-center text-gray-700 max-w-5xl mx-auto mb-16 text-lg">
            Career chính là điểm khởi đầu cho hành trình sự nghiệp của bạn.
            Chúng tôi sử dụng AI và Big Data để loại bỏ các rào cản, hỗ trợ giúp
            bạn tìm kiếm việc làm thực tập hơn từ chìn bạn, giúp bạn tự khám phá
            những cơ hội trong phát triển nghề nghiệp rộng mở của mình ngay hôm
            nay!
          </p>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-full max-w-7xl mx-auto h-56 md:h-96 relative rounded-lg overflow-hidden drop-shadow-lg">
              <Image
                src="/about-us/img-2.jpg"
                alt="Career Platform"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle title="GIÁ TRỊ CỐT LÕI" />

          <motion.div
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-x-40 gap-y-24 max-w-5xl mx-auto"
          >
            <motion.div
              variants={listItem}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#4F46E5] text-white flex-shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#5959EB] mb-1">
                  Định Hướng Tương Lai
                </h4>
                <p className="text-gray-600">
                  Sử dụng AI/Big Data để không chỉ tìm việc hiện tại mà còn vạch
                  ra lộ trình sự nghiệp đón đầu xu hướng.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={listItem}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#7C3AED] text-white flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#5959EB] mb-1">
                  Minh Bạch & Xác Thực
                </h4>
                <p className="text-gray-600">
                  Cung cấp thông tin việc làm rõ ràng, chính xác và đã được xác
                  thực, xây dựng niềm tin tuyệt đối với sinh viên.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={listItem}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FFD666] text-black flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#5959EB] mb-1">
                  Phát Triển Toàn Diện
                </h4>
                <p className="text-gray-600">
                  Thúc đẩy sinh viên tìm kiếm cơ hội giúp cân bằng học tập và
                  kinh nghiệm, phát triển toàn diện kỹ năng cứng và mềm.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={listItem}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EC4899] text-white flex-shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#5959EB] mb-1">
                  Khởi Nghiệp Tự Tin
                </h4>
                <p className="text-gray-600">
                  Cung cấp công cụ và cơ hội phù hợp để sinh viên tự tin bước
                  vào thị trường lao động hoặc khởi nghiệp với lợi thế cạnh
                  tranh.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-lg leading-relaxed text-gray-700 text-justify">
                Career được phát triển bởi chính nhóm sinh viên Khoa Công nghệ
                Thông tin, Trường Đại học Sư phạm Kỹ thuật Hưng Yên. Chúng tôi
                hiểu rõ những thách thức mà sinh viên phải đối mặt khi tìm kiếm
                việc làm và thực tập. Bằng cách ứng dụng các công nghệ tiên tiến
                như AI và Big Data, chúng tôi đã xây dựng nên Career – một công
                cụ mạnh mẽ giúp mọi sinh viên định hướng và chạm tới cơ hội nghề
                nghiệp đầu tiên một cách tự tin và hiệu quả nhất.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <Image
                  src="/logo/utehy.png"
                  alt="GHD - Hệ thống việc làm sinh viên UTEHY"
                  width={380}
                  height={380}
                  className="drop-shadow-2xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#0C6A4E] to-[#0a5441]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <StatCard
              icon="📋"
              number="+4.700.000"
              label="Số lượng tin tuyển dụng"
            />
            <StatCard
              icon="👥"
              number="+2.400.000"
              label="Số lượng người dùng trên nền tảng"
            />
            <StatCard
              icon="✓"
              number="+851.000"
              label="Người tìm được việc ở trên Career"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
