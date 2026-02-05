import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  variant = 'default',
  loading = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={
              variant === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook to easily use confirmation dialog
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default',
  });

  const confirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant?: 'default' | 'destructive'
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title,
        description,
        onConfirm: () => {
          onConfirm();
          resolve(true);
          setDialogState((prev) => ({ ...prev, open: false }));
        },
        variant,
      });
    });
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => {
        if (!open) {
          setDialogState((prev) => ({ ...prev, open: false }));
        }
      }}
      title={dialogState.title}
      description={dialogState.description}
      onConfirm={dialogState.onConfirm}
      variant={dialogState.variant}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
};
