"use client";

import { Building2, Globe, MapPin, Users2 } from "lucide-react";
import { PublicJobCompany } from "@/services/public";

interface CompanyDescriptionProps {
  company: PublicJobCompany | null;
}

function looksLikeHtml(text?: string | null): boolean {
  if (!text) return false;
  return /<\/?(p|br|ul|ol|li|strong|em|h[1-6]|div|span|a|table|tr|td)\b/i.test(text);
}

function ensureUrl(raw: string): string {
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export default function CompanyDescription({ company }: CompanyDescriptionProps) {
  if (!company) {
    return (
      <div className="bg-white p-4 sm:p-6 mt-1 text-sm text-gray-500">
        Chưa có thông tin công ty.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 mt-1">
      <h2 className="text-xl sm:text-2xl font-bold text-[#0C6A4E] mb-4">
        Giới thiệu công ty
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            {company.name || "Đang cập nhật"}
          </h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            {company.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{company.industry}</span>
              </div>
            )}
            {company.size && (
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-gray-400" />
                <span>{company.size}</span>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{company.address}</span>
              </div>
            )}
          </div>
        </div>

        {company.description && company.description.trim() && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Giới thiệu</h4>
            {looksLikeHtml(company.description) ? (
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: company.description }}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            )}
          </div>
        )}

        {company.website && (
          <div className="pt-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm sm:text-base font-medium text-gray-800">
              Website công ty:
            </span>
            <a
              href={ensureUrl(company.website)}
              className="text-sm sm:text-base text-[#0C6A4E] font-medium hover:underline hover:text-[#0C6A4E]"
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
