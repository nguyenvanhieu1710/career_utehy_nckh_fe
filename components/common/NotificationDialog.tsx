import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NotificationDialogProps } from "@/types/dialog";
import { CheckCircle2, AlertCircle, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationDialog = ({
  open,
  onOpenChange,
  title,
  message,
  type = "success",
}: NotificationDialogProps) => {
  const iconMap = {
    success: <CheckCircle2 className="h-12 w-12 text-green-500" />,
    error: <AlertCircle className="h-12 w-12 text-red-500" />,
    warning: <TriangleAlert className="h-12 w-12 text-yellow-500" />,
    info: <Info className="h-12 w-12 text-blue-500" />,
  };

  const titleColorMap = {
    success: "text-green-900",
    error: "text-red-900",
    warning: "text-yellow-900",
    info: "text-blue-900",
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[400px] bg-white">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="mb-4 animate-in zoom-in duration-300">
            {iconMap[type]}
          </div>
          <AlertDialogTitle className={cn("text-xl font-bold", titleColorMap[type])}>
            {title || (type === "success" ? "Thành công" : "Thông báo")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 pt-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center mt-2">
          <AlertDialogAction
            className={cn(
              "min-w-24 font-semibold",
              type === "success" && "bg-green-600 hover:bg-green-700",
              type === "error" && "bg-red-600 hover:bg-red-700",
              type === "warning" && "bg-yellow-600 hover:bg-yellow-700",
              type === "info" && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            Đóng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
