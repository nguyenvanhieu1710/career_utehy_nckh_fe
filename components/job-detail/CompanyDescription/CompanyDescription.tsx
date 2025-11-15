export default function CompanyDescription() {
  return (
    <div className="bg-white p-4 sm:p-6 mt-1">
      <h2 className="text-xl sm:text-2xl font-bold text-[#0C6A4E] mb-3 sm:mb-4">
        Giới thiệu công ty
      </h2>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Kyna English – Tiếng Anh Dành Cho Thế Hệ Mới
          </h3>
          <ul className="list-disc ml-5 sm:ml-6 mt-1 sm:mt-2 text-sm sm:text-base text-gray-700 leading-relaxed space-y-1">
            <li>Lớp học nhỏ mang lại hiệu quả cao</li>
            <li>Giáo trình có sẵn</li>
          </ul>
        </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-1">Tầm nhìn</h4>
        <p className="text-gray-700 leading-relaxed">
            Trao quyền và mở ra cơ hội cho thế hệ trẻ.
          </p>
        </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-1">Sứ mệnh của Kyna English</h4>
        <p className="text-gray-700 leading-relaxed">
            Chúng tôi mang lại sự bình đẳng trong việc tiếp cận các chương trình đào tạo
            ngôn ngữ chất lượng cao cho thế hệ trẻ và sử dụng công nghệ để thay thế
            các phương pháp học ngoại ngữ hiện nay đang sử dụng.
          </p>
        </div>

        <div className="pt-2">
          <span className="text-sm sm:text-base font-medium text-gray-800">Website công ty:</span>{" "}
          <a
            href="#"
            className="text-sm sm:text-base text-[#0C6A4E] font-medium hover:underline hover:text-[#0C6A4E]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kyna English
          </a>
        </div>
      </div>
    </div>
  );
}
