import Link from 'next/link';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[#1F2937]">Users</h1>
        <p className="mt-1 text-sm text-muted">
          View and manage learners, trainers and mentors.
        </p>
      </div>

      <Link
        href="/users/invite"
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
      >
        <Users size={18} strokeWidth={2} />
        <span>Invite users</span>
      </Link>
    </div>
  );
}