import { DollarSign, Briefcase } from "lucide-react";

type JobDescriptionProps = {
  // Props will be added later
};

export default function JobDescription({}: JobDescriptionProps) {
  return (
    <div className="bg-white p-6 mt-1">
      <div className="bg-white mt-1 mb-1">
        <div className="text-xl sm:text-2xl font-bold text-[#0C6A4E] mb-1">
          Chi tiết công việc
        </div>
        <div className="flex flex-col gap-1 text-xs sm:text-sm text-[#5C5C5C]">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span>Thu nhập: Upto 20M</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span>Loại hình: Toàn thời gian</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span>Chức vụ: Nhân viên</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
          Mô tả công việc
        </h3>
        <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>
            Dạy tiếng Anh trực tuyến 1 kèm 1 (hoặc 1 kèm 4) dành cho học viên
            trẻ em và người lớn (có thể lựa chọn).
          </li>
          <li>
            Được cung cấp tài liệu giảng dạy (có sẵn slide và lesson plan).
          </li>
          <li>
            Đăng ký ca làm việc và đánh dấu lịch trên ứng dụng của công ty.
          </li>
          <li>Thời lượng mỗi buổi học: 25 phút, 45 phút, 50 phút, 90 phút.</li>
          <li>
            Thời gian làm việc: có thể dạy tối thiểu 2.5 giờ trong khoảng thời
            gian từ 18:00 đến 22:00, ít nhất 3 buổi tối mỗi tuần.
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Yêu cầu</h3>
        <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>
            Ưu tiên sinh viên hoặc cử nhân tốt nghiệp ngành Giáo dục Tiếng
            Anh/Ngôn ngữ Anh.
          </li>
          <li>Phát âm chuẩn.</li>
          <li>
            Có kinh nghiệm dạy tiếng Anh hoặc gia sư cho trẻ em và người lớn.
          </li>
          <li>
            Có chứng chỉ IELTS/TESOL hoặc các chứng chỉ tiếng Anh là lợi thế.
          </li>
          <li>Thân thiện, nhiệt tình, kiên nhẫn là điểm cộng.</li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">Quyền lợi</h3>
        <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>
            Mức thù lao (và thưởng) tương đương 85.000đ – 110.000đ/giờ, tổng thu
            nhập lên đến 20.000.000đ/tháng.
          </li>
          <li>Môi trường làm việc năng động và chuyên nghiệp.</li>
          <li>Làm việc 100% online, không cần đến văn phòng.</li>
          <li>
            Cơ hội phát triển cá nhân, nâng cao trình độ tiếng Anh và kỹ năng.
          </li>
          <li>
            Làm việc trong lĩnh vực giáo dục trực tuyến đầy tiềm năng và sôi
            động.
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
          Thông tin chung
        </h3>
        <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>Thu nhập: Up to 20 triệu VND</li>
          <li>Làm việc toàn thời gian tại trung tâm / công ty.</li>
        </ul>
      </div>
    </div>
  );
}
