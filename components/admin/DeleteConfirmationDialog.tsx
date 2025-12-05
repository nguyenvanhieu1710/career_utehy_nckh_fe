// components/admin/DeleteConfirmationDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Bạn có chắc chắn muốn xóa?",
  description = "Dữ liệu sẽ mất vĩnh viễn!",
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm bg-white border-2 border-green-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center pr-8 text-green-900">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-center pt-6 pb-2">
          <span className="inline-block text-7xl mb-4">😓</span>
          <div className="text-base text-green-900 font-medium">
            {description}
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
          <AlertDialogCancel className="min-w-32 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-900 hover:border-green-600 cursor-pointer">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            className="min-w-32 bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            onClick={onConfirm}
          >
            Đồng ý
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
