import PageHeader from '@/components/ui/AppPageHeader';

// TODO: build out once a Trainer Dashboard Figma reference is available
// (we have "My Course" but not a literal Dashboard-home screen yet).
export default function TrainerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your trainer workspace."
      />
    </div>
  );
}
