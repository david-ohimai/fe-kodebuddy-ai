'use client';

import React from 'react';
import Link from 'next/link';
import AppButton, { AppButtonProps } from './AppButton';
import AppModal from './AppModal';

interface ModalLink {
  label?: string;
  href?: string;
  onClick?: () => void;
}

export interface AppConfirmModalProps {
  open: boolean;
  onClose: () => void;

  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;

  link?: ModalLink;

  primaryButton?: AppButtonProps;
  secondaryButton?: AppButtonProps;

  hideCloseOnBackdrop?: boolean;
  maxWidth?: string | number;
}

export default function AppConfirmModal({
  open,
  onClose,
  icon,
  title,
  description,
  link,
  primaryButton,
  secondaryButton,
  hideCloseOnBackdrop = false,
  maxWidth = 500,
}: AppConfirmModalProps) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      hideCloseOnBackdrop={hideCloseOnBackdrop}
      showCloseButton={false}
    >
      <div className="flex min-h-70 w-full flex-col items-center justify-center px-6 py-8 text-center">
        {icon && (
          <div className="mb-5 flex justify-center">
            {icon}
          </div>
        )}

        {title && (
          <h2
            id="app-modal-title"
            className="mb-2 h5-b text-text"
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            id="app-modal-description"
            className="mb-3 max-w-[383px] b1-m text-text-secondary"
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

        {(primaryButton || secondaryButton) && (
          <div className="flex w-full items-center gap-2">
            {secondaryButton?.label && (
              <AppButton
                variant="outlined"
                color="neutral"
                size="medium"
                radius="full"
                {...secondaryButton}
                disabled={
                  secondaryButton.disabled ||
                  secondaryButton.loading
                }
                className={`flex-1 min-w-0 ${
                  secondaryButton.className ?? ''
                }`}
              />
            )}

            {primaryButton?.label && (
              <AppButton
                variant="contained"
                size="medium"
                radius="full"
                {...primaryButton}
                disabled={
                  primaryButton.disabled ||
                  primaryButton.loading
                }
                className={`flex-1 min-w-0 ${
                  primaryButton.className ?? ''
                }`}
              />
            )}
          </div>
        )}
      </div>
    </AppModal>
  );
}
