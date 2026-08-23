import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';
import AppButton from '@/components/ui/AppButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <AppLogo withTitle width={220} height={42} />
      <p className="b1-r max-w-md text-text-secondary">
        Your AI-powered KodeCamp learning assistant.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-up">
          <AppButton radius="full" size="large">
            Get started
          </AppButton>
        </Link>
        <Link href="/sign-in">
          <AppButton
            radius="full"
            size="large"
            variant="outlined"
            color="neutral"
          >
            Sign in
          </AppButton>
        </Link>
      </div>
    </main>
  );
}
