import PageHeader from '@/components/ui/AppPageHeader';

// TODO: build out per the My Cohort section of the Trainer Figma.
export default function MyCohortPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Cohort"
        subtitle="View the learners in your assigned cohort."
      />
    </div>
  );
}
