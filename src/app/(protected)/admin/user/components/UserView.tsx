'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import user from '@/assets/images/user.webp';
import { useRouter } from 'next/navigation';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'trainer' | 'mentor';
  status: 'active' | 'inactive';
}

const ROLE_OPTIONS = [
  { label: 'All Role', value: 'all' },
  { label: 'Learner', value: 'learner' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Mentor', value: 'mentor' },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const users: UserRow[] = [];

const UsersView: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  const hasUsers = users.length > 0;
  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="View and manage learners, trainers and mentors."
        actions={
          <AppButton 
            startIcon={<UserPlus size={18} />}
            onClick={() => router.push('user/invite')}
            >
            Invite users
              
          </AppButton>
        }
      />

      <AppCard padding="none" className="mt-6">
        <div className="p-4">
          <TableHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or email"
            filters={[
              {
                id: 'role',
                value: role,
                options: ROLE_OPTIONS,
                onChange: setRole,
                ariaLabel: 'Filter by role',
              },
              {
                id: 'status',
                value: status,
                options: STATUS_OPTIONS,
                onChange: setStatus,
                ariaLabel: 'Filter by status',
              },
            ]}
          />
        </div>

        {hasUsers ? (
          <ul>
            {/* TODO: user rows go here once data is wired up */}
          </ul>
        ) : (
          <AppEmptyState
            image={user}
            title="No users yet"
            description="Invite a Trainer or Mentor to start building your KodeBuddy community."
          />
        )}
      </AppCard>
    </div>
  );
};

export default UsersView;
