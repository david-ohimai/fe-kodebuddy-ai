import AppButton from '@/components/ui/AppButton';

// TODO: build out per the "Ready to start learning?" closing CTA
// section of the Figma (blue background, pattern).
export default function CtaSection() {
  return (
    <section className="bg-primary px-6 py-20 text-center">
      <h2 className="h3-b text-white">Ready to start learning?</h2>
      <p className="b1-r mx-auto mt-2 max-w-md text-white/80">
        Create your KodeBuddy account and begin your learning journey.
      </p>
      <AppButton
        href="/sign-up"
        variant="contained"
        color="neutral"
        radius="full"
        size="large"
        className="mt-6 !bg-white !text-primary"
      >
        Get Started
      </AppButton>
    </section>
  );
}
