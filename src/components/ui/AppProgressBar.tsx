export interface AppProgressBarProps {
  percent: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}

export default function AppProgressBar({
  percent,
  className,
  trackClassName,
  barClassName,
}: AppProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={
        'h-2 overflow-hidden rounded-full bg-disabled' +
        (trackClassName ? ` ${trackClassName}` : '') +
        (className ? ` ${className}` : '')
      }
    >
      <div
        className={
          'h-full rounded-full bg-secondary transition-all' +
          (barClassName ? ` ${barClassName}` : '')
        }
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
