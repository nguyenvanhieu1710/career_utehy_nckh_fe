"use client";

import { useState, useEffect } from "react";
import { Search, X, TrendingUp, MapPin, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JobSearchProps {
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

interface SearchSuggestion {
  type: "keyword" | "location" | "skill" | "company";
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const JobSearch = ({
  value = "",
  onSearch,
  placeholder = "Tìm kiếm theo vị trí, công ty, kỹ năng...",
  loading = false,
  className = "",
}: JobSearchProps) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock search suggestions
  const popularSearches: SearchSuggestion[] = [
    {
      type: "keyword",
      value: "frontend developer",
      label: "Frontend Developer",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      type: "keyword",
      value: "react",
      label: "React Developer",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      type: "keyword",
      value: "nodejs",
      label: "Node.js Developer",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      type: "location",
      value: "hanoi",
      label: "Hà Nội",
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      type: "location",
      value: "hcm",
      label: "TP.HCM",
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      type: "skill",
      value: "typescript",
      label: "TypeScript",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      type: "skill",
      value: "python",
      label: "Python",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      type: "company",
      value: "techviet",
      label: "TechViet Solutions",
      icon: <Briefcase className="h-4 w-4" />,
    },
  ];

  const [filteredSuggestions, setFilteredSuggestions] = useState<
    SearchSuggestion[]
  >([]);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    if (searchValue.trim()) {
      const filtered = popularSearches.filter(
        (suggestion) =>
          suggestion.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          suggestion.value.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 6));
    } else {
      setFilteredSuggestions(popularSearches.slice(0, 6));
    }
  }, [searchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchValue(suggestion.label);
    onSearch(suggestion.value);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case "keyword":
        return "text-blue-600 bg-blue-50";
      case "location":
        return "text-green-600 bg-green-50";
      case "skill":
        return "text-purple-600 bg-purple-50";
      case "company":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case "keyword":
        return "Từ khóa";
      case "location":
        return "Địa điểm";
      case "skill":
        return "Kỹ năng";
      case "company":
        return "Công ty";
      default:
        return "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative transition-all duration-200">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />

          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={loading}
            className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          />

          {/* Clear button */}
          {searchValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {searchValue.trim() ? "Gợi ý tìm kiếm" : "Tìm kiếm phổ biến"}
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="py-2">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                  >
                    <div
                      className={`p-1.5 rounded-full ${getSuggestionTypeColor(
                        suggestion.type
                      )}`}
                    >
                      {suggestion.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 group-hover:text-green-600 transition-colors">
                          {suggestion.label}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getSuggestionTypeColor(
                            suggestion.type
                          )}`}
                        >
                          {getSuggestionTypeLabel(suggestion.type)}
                        </span>
                      </div>
                    </div>

                    <Search className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không tìm thấy gợi ý phù hợp</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!searchValue.trim() && (
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Tìm kiếm nhanh
                </div>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "Python", "Hà Nội", "TP.HCM"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          handleSuggestionClick({
                            type: "keyword",
                            value: tag.toLowerCase(),
                            label: tag,
                          })
                        }
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
