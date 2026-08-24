'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserPlus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import TableHeader from '@/components/ui/AppTableHeader';
import noUsersImg from '@/assets/images/no-users.webp';

const ROLE_OPTIONS = [
  { label: 'All Role', value: '' },
  { label: 'Learner', value: 'learner' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Mentor', value: 'mentor' },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const users: Array<{ id: string }> = [];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const hasUsers = users.length > 0;

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

      <AppCard padding="none">
        <TableHeader
          searchValue={search}
          onSearchChange={setSearch}
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
          className="rounded-b-none border-b border-muted/20"
        />

        {hasUsers ? (
          <div />
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Image
              src={noUsersImg}
              alt=""
              width={154}
              height={100}
              className="mb-4"
            />
            <p className="b1-b text-text">No users yet</p>
            <p className="b2-r mt-1 max-w-sm text-muted">
              Invite a Trainer or Mentor to start building your KodeBuddy
              community.
            </p>
          </div>
        )}
      </AppCard>
    </div>
  );
}
