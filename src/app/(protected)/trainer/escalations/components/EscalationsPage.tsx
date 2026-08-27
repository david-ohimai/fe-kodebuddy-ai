import PageHeader from '@/components/ui/AppPageHeader';

export default function EscalationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Escalations"
        subtitle="Review learner questions escalated to you for human support."
      />
    </div>
  );
}
