import AppButton, { type AppButtonProps } from '@/components/ui/AppButton';

type LandingOutlineButtonProps = Omit<
  AppButtonProps,
  'color' | 'radius' | 'variant'
>;

export default function LandingOutlineButton({
  className,
  ...props
}: LandingOutlineButtonProps) {
  return (
    <AppButton
      {...props}
      variant="outlined"
      color="primary"
      radius="full"
      className={['!px-6', className].filter(Boolean).join(' ')}
    />
  );
}
