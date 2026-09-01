import AppButton from '@/components/ui/AppButton';

// TODO: build out per the Hero section of the landing page Figma —
// "Learn practical skills. Build your future." headline, subtext,
// Get Started/Explore courses buttons, and the dashboard preview mockup.
export default function HeroSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h1 className="h2-b text-text">
        Learn practical skills. <span className="text-primary">Build your future.</span>
      </h1>
      <p className="b1-r mx-auto mt-4 max-w-xl text-text-secondary">
        KodeBuddy gives you a structured learning space to learn, practise,
        complete assignments, access resources, and get support throughout
        your learning journey.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <AppButton href="/sign-up" radius="full" size="large">
          Get Started
        </AppButton>
        <AppButton
          href="#courses"
          variant="outlined"
          color="neutral"
          radius="full"
          size="large"
        >
          Explore courses
        </AppButton>
      </div>
    </section>
  );
}
