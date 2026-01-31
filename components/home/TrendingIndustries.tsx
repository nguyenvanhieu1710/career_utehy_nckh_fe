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
          className="text-4xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Đang tải ngành nghề...</span>
          </div>
        )}

        {/* Error State (with fallback data) */}
        {error && !loading && (
          <div className="text-center py-4 mb-6">
            <p className="text-yellow-600 text-sm">
              ⚠️ Không thể tải dữ liệu từ server, hiển thị dữ liệu mặc định
            </p>
          </div>
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
          <div className="text-center py-12">
            <p className="text-gray-500">
              Chưa có ngành nghề nào được hiển thị
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
