'use client';

import { Snackbar, Slide, SlideProps, IconButton } from '@mui/material';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastData {
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
  autoHideDuration?: number | null;
}

function SlideLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export default function Toast({
  toast,
  onClose,
  autoHideDuration = 3500,
}: ToastProps) {
  const isSuccess = toast?.type === 'success';

  const handleClose = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  return (
    <Snackbar
      open={!!toast}
      onClose={handleClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      slots={{ transition: SlideLeft }}
      sx={{ top: { xs: '16px', sm: '20px' }, right: { xs: '16px', sm: '20px' } }}
    >
      <div
        role="alert"
        className="flex max-w-[320px] items-start gap-3 rounded-card! bg-background px-4! py-3.5! shadow-lg sm:w-[320px]"
      >
        {isSuccess ? (
          <CheckCircle size={20} className="mt-0.5 shrink-0 text-success" />
        ) : (
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-error" />
        )}

        <div className="min-w-0 flex-1">
          <p className="b2-b mb-0.5 text-text">{toast?.title}</p>
          <p className="f1-r text-text-secondary">{toast?.message}</p>
        </div>

        <IconButton
          onClick={onClose}
          aria-label="Close notification"
          size="small"
          className="shrink-0! p-0! text-muted! transition-opacity hover:opacity-70"
        >
          <X size={16} />
        </IconButton>
      </div>
    </Snackbar>
  );
}
