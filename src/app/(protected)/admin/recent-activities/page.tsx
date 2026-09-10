import RecentActivitiesPage from '@/components/activity/RecentActivitiesPage';

export default function AdminRecentActivitiesPage() {
  return (
    <RecentActivitiesPage
      dashboardHref="/admin/dashboard"
      emptyDescription="Platform activity will appear here as users, courses, and cohorts are managed."
      role="admin"
    />
  );
}
