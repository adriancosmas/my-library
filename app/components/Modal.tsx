import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ModalProps = {
    open: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger>
        </DialogTrigger>
        <DialogTitle>
        </DialogTitle>
        <DialogContent className="sm:max-w-md" showCloseButton={false} style={{ width: "fit-content" }}>
            {children}
        </DialogContent>
    </Dialog>
  );
}
