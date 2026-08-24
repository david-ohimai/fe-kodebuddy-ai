import { UserPlus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h5-b text-text">Users</h1>
          <p className="b2-r text-muted mt-1">
            View and manage learners, trainers and mentors.
          </p>
        </div>

        <AppButton
          href="/admin/users/invite"
          startIcon={<UserPlus size={18} strokeWidth={2} />}
          radius="full"
        >
          Invite users
        </AppButton>
      </div>
    </div>
  );
}
