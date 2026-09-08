import RecentActivitiesPage from '@/components/activity/RecentActivitiesPage';

export default function LearnerRecentActivitiesPage() {
  return (
    <RecentActivitiesPage
      dashboardHref="/dashboard"
      emptyDescription="Your learning activity will appear here."
      role="learner"
    />
  );
}
