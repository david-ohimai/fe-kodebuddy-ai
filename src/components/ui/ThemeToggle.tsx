'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import AppButton from './AppButton';

const ORDER = ['light', 'dark', 'system'] as const;
type ThemeChoice = (typeof ORDER)[number];

const ICONS: Record<ThemeChoice, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LABELS: Record<ThemeChoice, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'Matching your device',
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const current: ThemeChoice =
    theme === 'light' || theme === 'dark' ? theme : 'system';
  const Icon = mounted ? ICONS[current] : Monitor;

  const handleClick = () => {
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setTheme(next);
  };

  return (
    <AppButton
      variant="outlined"
      color="neutral"
      size="icon"
      onClick={handleClick}
      ariaLabel={
        mounted ? `Theme: ${LABELS[current]}. Click to change.` : 'Theme'
      }
      className="!h-9 !w-9 !rounded-input !border-disabled !text-text-secondary hover:!bg-primary-light hover:!text-primary"
    >
      <Icon size={18} />
    </AppButton>
  );
}
