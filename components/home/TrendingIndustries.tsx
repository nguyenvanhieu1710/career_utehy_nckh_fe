"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/common/SectionTitle";
import PaginationArrows from "../common/PaginationArrows";
import { categoryAPI } from "@/services/category";
import { PublicCategory } from "@/types/category";
import { logger } from "@/lib/logger";

export default function TrendingIndustries() {
  // Data states
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await categoryAPI.getPublicCategories();

        setCategories(response.data.data || []);
      } catch (err) {
        logger.error("Failed to fetch categories", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Use fallback data if no categories loaded
  const displayCategories = categories.length > 0 ? categories : [];

  // Pagination calculations
  const totalPages = Math.ceil(displayCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCategories = displayCategories.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Reset to page 1 when categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="NGÀNH NGHỀ NỔI BẬT"
          className="text-4xl leading-relaxed bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Đang tải ngành nghề...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && displayCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-16"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border border-green-200">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Không thể tải dữ liệu
              </h3>
              <p className="text-gray-600 mb-6">
                Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và
                thử lại.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                Tải lại trang
              </button>
            </div>
          </motion.div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {currentCategories.map((category, index) => {
              const avatarUrl = categoryAPI.getPublicAvatarUrl(category);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 p-4 h-full flex flex-col">
                    <div className="w-full h-32 mb-6 overflow-hidden rounded-lg">
                      <img
                        src={avatarUrl}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-category.png";
                        }}
                      />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg text-center font-bold text-gray-800 leading-tight mb-2">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center mt-12 gap-4">
            {/* Page Indicator */}
            {/* <div className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages} ({displayCategories.length}{" "}
              ngành nghề)
            </div> */}

            {/* Pagination Arrows */}
            <PaginationArrows
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center py-16"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 shadow-lg">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Chưa có ngành nghề nào
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Hiện tại chưa có ngành nghề nào được thêm vào hệ thống. Vui lòng
                quay lại sau hoặc liên hệ quản trị viên.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-white text-green-700 rounded-lg font-semibold border-2 border-green-700 hover:bg-green-50 transition-all duration-300"
                >
                  Tải lại
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
