'use client';

import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export interface AppModalProps {
  open: boolean;
  onClose: () => void;

  title?: React.ReactNode;
  description?: React.ReactNode;

  children?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;

  showCloseButton?: boolean;
  hideCloseOnBackdrop?: boolean;

  maxWidth?: string | number;
  contentClassName?: string;
}

export default function AppModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  header,
  showCloseButton = true,
  hideCloseOnBackdrop = false,
  maxWidth = 500,
  contentClassName = '',
}: AppModalProps) {
  const handleClose = (
    _event: object,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => {
    if (reason === 'backdropClick' && hideCloseOnBackdrop) {
      return;
    }

    onClose();
  };

  const hasHeader = Boolean(header || title || description);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby={title ? 'app-modal-title' : undefined}
      aria-describedby={description ? 'app-modal-description' : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth,
          maxHeight: 'calc(100vh - 32px)',
          bgcolor: 'var(--background)',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        className={contentClassName}
      >
        {hasHeader && (
          <div className="relative shrink-0 border-b border-disabled px-6 py-5">
            {header ? (
              header
            ) : (
              <>
                {title && (
                  <h2
                    id="app-modal-title"
                    className="h5-b pr-8 text-text"
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <p
                    id="app-modal-description"
                    className="mt-1 b2-r text-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </>
            )}

            {showCloseButton && (
              <IconButton
                onClick={onClose}
                aria-label="Close modal"
                size="small"
                className="absolute right-4 top-4 p-1"
              >
                <CloseIcon
                  fontSize="small"
                  className="text-text"
                />
              </IconButton>
            )}
          </div>
        )}

        {children && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        )}

        {footer && (
          <div className="shrink-0 border-t border-disabled px-6 py-4">
            {footer}
          </div>
        )}

        {!hasHeader && showCloseButton && (
          <IconButton
            onClick={onClose}
            aria-label="Close modal"
            size="small"
            className="absolute right-4 top-4 p-1"
          >
            <CloseIcon
              fontSize="small"
              className="text-text"
            />
          </IconButton>
        )}
      </Box>
    </Modal>
  );
}
