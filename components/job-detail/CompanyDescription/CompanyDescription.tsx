import { Globe } from "lucide-react";

type CompanyDescriptionProps = {
  company: any;
};

export default function CompanyDescription({ company }: CompanyDescriptionProps) {
  if (!company) return null;

  return (
    <div className="bg-white p-4 sm:p-6 mt-1">
      <h2 className="text-xl sm:text-2xl font-bold text-[#0C6A4E] mb-4">
        Giới thiệu công ty
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {company.name || "---"}
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {company.description || "---"}
          </div>
        </div>

        {company.location && (
          <div>
            <h4 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Địa chỉ</h4>
            <p className="text-gray-700 text-sm sm:text-base">{company.location || "---"}</p>
          </div>
        )}

        {company.website && (
          <div className="pt-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm sm:text-base font-medium text-gray-800">Website:</span>{" "}
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              className="text-sm sm:text-base text-[#0C6A4E] font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {company.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
