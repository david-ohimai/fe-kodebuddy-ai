import PageHeader from '@/components/ui/AppPageHeader';

export default function AdminSettings() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and platform preferences."
      />
    </div>
  );
}
