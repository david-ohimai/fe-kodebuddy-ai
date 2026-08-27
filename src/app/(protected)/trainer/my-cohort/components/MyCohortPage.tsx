import PageHeader from '@/components/ui/AppPageHeader';

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
