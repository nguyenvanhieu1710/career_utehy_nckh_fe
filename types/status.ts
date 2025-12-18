export enum EntityStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETED = "deleted",
}

export interface StatusOption {
  value: EntityStatus;
  label: string;
  color: string;
  description: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: EntityStatus.ACTIVE,
    label: "Hoạt động",
    color: "green",
    description: "Đang hoạt động bình thường",
  },
  {
    value: EntityStatus.INACTIVE,
    label: "Không hoạt động",
    color: "yellow",
    description: "Tạm thời không hoạt động",
  },
  {
    value: EntityStatus.DELETED,
    label: "Đã xóa",
    color: "red",
    description: "Đã bị xóa khỏi hệ thống",
  },
];

export const getStatusOption = (status: string): StatusOption => {
  return (
    STATUS_OPTIONS.find((option) => option.value === status) ||
    STATUS_OPTIONS[0]
  );
};

export const getStatusLabel = (status: string): string => {
  return getStatusOption(status).label;
};

export const getStatusColor = (status: string): string => {
  return getStatusOption(status).color;
};
