'use client';

import React from 'react';
import Link from 'next/link';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AppButton, { AppButtonProps } from './AppButton';

type ModalLink = {
  label?: string;
  href?: string;
  onClick?: () => void;
};

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  link?: ModalLink;
  primaryButton?: AppButtonProps;
  secondaryButton?: AppButtonProps;
  hideCloseOnBackdrop?: boolean;
  maxWidth?: string;
  children?: React.ReactNode;
}

export default function AppModal({
  open,
  onClose,
  icon,
  title,
  description,
  link,
  primaryButton,
  secondaryButton,
  hideCloseOnBackdrop = false,
  maxWidth = '500px',
  children,
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="app-modal-title"
      aria-describedby="app-modal-description"
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
          bgcolor: 'background.paper',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          outline: 'none',
          px: {
            xs: 3,
            sm: 4,
          },
        }}
      >
        <div className="mx-auto flex w-full max-w-[400px] h-[280px] flex-col justify-center items-center text-center">
          {icon && <div className="mb-5 flex justify-center">{icon}</div>}

          {title && (
            <h2 id="app-modal-title" className="mb-2 h5-b ">
              {title}
            </h2>
          )}

          {description && (
            <p
              id="app-modal-description"
              className="mb-3 text-text-secondary b1-m max-w-[383] leading-6 "
            >
              {description}
            </p>
          )}

          {link?.label &&
            (link.href ? (
              <Link
                href={link.href}
                onClick={link.onClick}
                className="mb-6 b2-b text-primary underline underline-offset-4"
              >
                {link.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={link.onClick}
                className="mb-6 b2-b text-primary underline underline-offset-4"
              >
                {link.label}
              </button>
            ))}

          {children && <div className="mb-6 w-full">{children}</div>}

          {(primaryButton || secondaryButton) && (
            <div className="flex w-full items-center justify-between gap-2">
              {secondaryButton?.label && (
                <AppButton
                  variant="outlined"
                  color="neutral"
                  size="medium"
                  radius="full"
                  {...secondaryButton}
                  disabled={secondaryButton.disabled || secondaryButton.loading}
                  className={`flex-1 ${secondaryButton.className ?? ''}`}
                />
              )}

              {primaryButton?.label && (
                <AppButton
                  variant="contained"
                  size="medium"
                  radius="full"
                  {...primaryButton}
                  disabled={primaryButton.disabled || primaryButton.loading}
                  className={`flex-1 ${primaryButton.className ?? ''}`}
                />
              )}
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
}
