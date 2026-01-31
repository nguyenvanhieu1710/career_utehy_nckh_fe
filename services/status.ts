import api from "@/cores/api";
import { StatusOption, EntityStatus, STATUS_OPTIONS } from "@/types/status";

export interface StatusResponse {
  status: string;
  data: StatusOption[];
}

export const statusAPI = {
  // Get status options from backend
  getStatusOptions: () => api.get<StatusResponse>("/common/status-options"),

  // Local helper methods (fallback if API fails)
  getLocalStatusOptions: (): StatusOption[] => STATUS_OPTIONS,

  // Get status option by value
  getStatusOption: (status: string): StatusOption => {
    return (
      STATUS_OPTIONS.find((option) => option.value === status) ||
      STATUS_OPTIONS[0]
    );
  },

  // Get status label
  getStatusLabel: (status: string): string => {
    return statusAPI.getStatusOption(status).label;
  },

  // Get status color
  getStatusColor: (status: string): string => {
    return statusAPI.getStatusOption(status).color;
  },

  // Check if status is valid
  isValidStatus: (status: string): boolean => {
    return Object.values(EntityStatus).includes(status as EntityStatus);
  },

  // Get default status
  getDefaultStatus: (): EntityStatus => {
    return EntityStatus.ACTIVE;
  },

  // Format status for display
  formatStatus: (
    status: string,
  ): { label: string; color: string; value: string } => {
    const option = statusAPI.getStatusOption(status);
    return {
      label: option.label,
      color: option.color,
      value: option.value,
    };
  },
};
