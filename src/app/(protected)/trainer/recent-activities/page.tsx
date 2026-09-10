import RecentActivitiesPage from '@/components/activity/RecentActivitiesPage';

export default function TrainerRecentActivitiesPage() {
  return (
    <RecentActivitiesPage
      dashboardHref="/trainer/dashboard"
      emptyDescription="Activity from your cohort will appear here."
      role="trainer"
    />
  );
}
