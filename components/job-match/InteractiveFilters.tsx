"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiSelect?: boolean;
}

interface InteractiveFiltersProps {
  filterGroups: FilterGroup[];
  onFiltersChange?: (filters: Record<string, string[]>) => void;
  className?: string;
}

export function InteractiveFilters({
  filterGroups,
  onFiltersChange,
  className = "",
}: InteractiveFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterToggle = (
    groupId: string,
    optionId: string,
    multiSelect: boolean = true
  ) => {
    const currentGroupFilters = selectedFilters[groupId] || [];
    let newGroupFilters: string[];

    if (multiSelect) {
      if (currentGroupFilters.includes(optionId)) {
        newGroupFilters = currentGroupFilters.filter((id) => id !== optionId);
      } else {
        newGroupFilters = [...currentGroupFilters, optionId];
      }
    } else {
      newGroupFilters = currentGroupFilters.includes(optionId)
        ? []
        : [optionId];
    }

    const newFilters = {
      ...selectedFilters,
      [groupId]: newGroupFilters,
    };

    setSelectedFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFiltersChange?.({});
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, filters) => total + filters.length,
      0
    );
  };

  const getSelectedFilterLabels = () => {
    const labels: Array<{ groupId: string; optionId: string; label: string }> =
      [];

    Object.entries(selectedFilters).forEach(([groupId, optionIds]) => {
      const group = filterGroups.find((g) => g.id === groupId);
      if (group) {
        optionIds.forEach((optionId) => {
          const option = group.options.find((o) => o.id === optionId);
          if (option) {
            labels.push({ groupId, optionId, label: option.label });
          }
        });
      }
    });

    return labels;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Bộ lọc phân tích</span>
          {getTotalSelectedCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getTotalSelectedCount()}
            </Badge>
          )}
        </button>

        {getTotalSelectedCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Selected Filters Display */}
      {getTotalSelectedCount() > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {getSelectedFilterLabels().map(({ groupId, optionId, label }) => (
              <motion.div
                key={`${groupId}-${optionId}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                <span>{label}</span>
                <button
                  onClick={() => {
                    const group = filterGroups.find((g) => g.id === groupId);
                    handleFilterToggle(groupId, optionId, group?.multiSelect);
                  }}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Options */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 space-y-6">
          {filterGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <h4 className="font-medium text-gray-900">{group.label}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.options.map((option) => {
                  const isSelected =
                    selectedFilters[group.id]?.includes(option.id) || false;

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() =>
                        handleFilterToggle(
                          group.id,
                          option.id,
                          group.multiSelect
                        )
                      }
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {option.count !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Quick Filter Buttons
interface QuickFilterProps {
  filters: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
  onFilterClick?: (filterId: string) => void;
  className?: string;
}

export function QuickFilters({
  filters,
  onFilterClick,
  className = "",
}: QuickFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterClick?.(filter.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            filter.active
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
