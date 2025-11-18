// components/admin/SuccessDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuccessDialog = ({ open, onOpenChange }: SuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="hidden" />
        <div className="flex flex-col items-center justify-center gap-6 py-10">
          <span className="text-8xl">😊</span>
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Thêm thành công</h3>
            <p className="mt-2 text-muted-foreground">
              Dữ liệu đã thêm thành công!
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            value="OK"
            onClick={() => onOpenChange(false)}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
