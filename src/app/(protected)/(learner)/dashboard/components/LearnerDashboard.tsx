import { AppCard } from '@/components/ui/AppCard';

export default function LearnerDashboard() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="h4-b text-text">Welcome back 👋</h1>
      <p className="b1-r mb-4 text-text-secondary">
        Your learner dashboard is coming soon — this is a placeholder landing
        spot for the auth &amp; onboarding flow.
      </p>

      <AppCard padding="lg" className="max-w-lg">
        <p className="b2-r text-text-secondary">
          Assigned courses, progress tracking, and KodeBuddy AI chat will live
          here per the KodeBuddy AI PRD (§8 Learner journey, §15 Learner
          requirements).
        </p>
      </AppCard>
    </div>
  );
}
