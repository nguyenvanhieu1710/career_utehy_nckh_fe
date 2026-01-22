import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationDialogProps } from "@/types/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const NotificationDialog = ({
  open,
  onOpenChange,
  title = "Thêm thành công",
  message = "Dữ liệu đã thêm thành công!",
  icon = "😊",
  type = "success",
}: NotificationDialogProps) => {
  const iconMap = {
    success: "😊",
    error: "😓",
    warning: "⚠️",
    info: "ℹ️",
  };

  const displayIcon = icon || iconMap[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm bg-white border-2 border-green-200"
        showCloseButton={false}
      >
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-6 py-10">
          <span className="text-8xl">{displayIcon}</span>
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-green-900">{title}</h3>
            <p className="mt-2 text-green-700">{message}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => onOpenChange(false)}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 active:bg-green-800 cursor-pointer"
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
