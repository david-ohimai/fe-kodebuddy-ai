'use client';

import { Close } from '@mui/icons-material';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import React from 'react';

export interface AppPillProps
  extends Omit<ChipProps, 'variant' | 'size' | 'color'> {
  label: string;
  onDelete?: (event: React.MouseEvent) => void;
  color?: 'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'success';
  border?: boolean;
  size?: 'small' | 'medium';
  shape?: 'pill' | 'rectangle';
  className?: string;
}

const COLOR_STYLES: Record<
  NonNullable<AppPillProps['color']>,
  { bg: string; text: string; border: string }
> = {
  default: {
    bg: 'var(--muted)',
    text: 'var(--text)',
    border: 'var(--muted)',
  },
  primary: {
    bg: 'var(--primary-light)',
    text: 'var(--primary-dark)',
    border: 'var(--primary)',
  },
  secondary: {
    bg: 'var(--secondary-light)',
    text: 'var(--secondary-dark)',
    border: 'var(--secondary)',
  },
  warning: {
    bg: 'var(--warning-light)',
    text: 'var(--warning-dark)',
    border: 'var(--warning)',
  },
  error: {
    bg: 'var(--error-light)',
    text: 'var(--error-dark)',
    border: 'var(--error)',
  },
  success: {
    bg: 'var(--success-light)',
    text: 'var(--success-dark)',
    border: 'var(--success)',
  },
};

export default function AppPill({
  label,
  onDelete,
  color = 'default',
  border = false,
  size = 'small',
  shape = 'pill',
  className,
  sx,
  ...rest
}: AppPillProps) {
  const styles = COLOR_STYLES[color];

  return (
    <Chip
      label={label}
      onDelete={onDelete}
      deleteIcon={
        onDelete ? (
          <Close
            sx={{
              fontSize: '14px !important',
              color: 'var(--disabled) !important',
              '&:hover': {
                color: 'var(--text) !important',
              },
            }}
          />
        ) : undefined
      }
      size={size}
      className={className}
      {...rest}
      sx={[
        {
          backgroundColor: border ? 'transparent' : styles.bg,
          color: styles.text,
          border: border ? `1px solid ${styles.border}` : 'none',
          borderRadius: shape === 'pill' ? '9999px' : '8px',
          fontSize: size === 'small' ? '12px' : '14px',
          fontWeight: 500,
          fontFamily: 'var(--font-app-font)',
          height: size === 'small' ? 28 : 32,
          padding: size === 'small' ? '4px 8px' : '4px 8px',

          '& .MuiChip-label': {
            px: '10px',
          },

          '& .MuiChip-icon': {
            fontSize: '14px',
            color: 'inherit',
            margin: 0,
          },

          '& .MuiChip-deleteIcon': {
            margin: 0,
            marginLeft: '4px',
            marginRight: '0',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}
