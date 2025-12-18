import { EntityStatus } from "./status";

export type DialogType = "success" | "error" | "warning" | "info";

export interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: DialogType;
}

export interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  icon?: string;
  type?: DialogType;
}

export interface AccountDialogData {
  fullname?: string;
  email?: string;
  role?: string;
  status?: EntityStatus | string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AccountDialogSubmitData {
  fullname: string;
  email: string;
  role: string;
  status: EntityStatus;
  avatarFile?: File;
  roles?: string[];
  permissions?: string[];
}
