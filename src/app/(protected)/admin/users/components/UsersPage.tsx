'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Star,
  User,
  UserCog,
} from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import PageHeader from '@/components/ui/AppPageHeader';
import TableHeader from '@/components/ui/AppTableHeader';
import AppPagination from '@/components/ui/AppPagination';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import noUsersImg from '@/assets/images/no-users.webp';
import type { AuthUser, UserRole } from '@/types/auth.types';

const ROLE_OPTIONS = [
  { label: 'All Role', value: '' },
  { label: 'Learner', value: 'learner' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Mentor', value: 'mentor' },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

const ROLE_META: Record<
  UserRole,
  {
    label: string;
    color: 'primary' | 'success' | 'warning' | 'secondary';
    icon: React.ReactElement;
  }
> = {
  learner: { label: 'Learner', color: 'primary', icon: <User size={12} /> },
  trainer: {
    label: 'Trainer',
    color: 'success',
    icon: <GraduationCap size={12} />,
  },
  mentor: { label: 'Mentor', color: 'warning', icon: <Star size={12} /> },
  admin: {
    label: 'Admin',
    color: 'secondary',
    icon: <ShieldCheck size={12} />,
  },
};

function formatJoinedDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function UsersPage() {
  const { user: currentUser } = useCurrentUserContext();
  const { showError } = useToast();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    profileApi
      .listUsers()
      .then((list) => {
        if (!cancelled) setUsers(list);
      })
      .catch((err) => {
        if (!cancelled) {
          showError(
            'Could not load users',
            getErrorMessage(err, 'Please try again.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !query ||
        u.email.toLowerCase().includes(query) ||
        (u.fullName ?? '').toLowerCase().includes(query);
      const matchesRole = !role || u.role === role;
      const matchesStatus =
        !status || (status === 'active' ? u.isActive : !u.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const rangeStart =
    filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredUsers.length);

  const hasUsers = pagedUsers.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Users"
        subtitle="View and manage learners, trainers and mentors."
        actions={
          <AppButton
            href="/admin/users/assign-role"
            startIcon={<UserCog size={18} strokeWidth={2} />}
            radius="full"
          >
            Assign role
          </AppButton>
        }
      />

      <AppCard padding="none">
        <TableHeader
          searchValue={search}
          onSearchChange={handleSearchChange}
          filters={[
            {
              id: 'role',
              value: role,
              options: ROLE_OPTIONS,
              onChange: handleRoleChange,
              ariaLabel: 'Filter by role',
            },
            {
              id: 'status',
              value: status,
              options: STATUS_OPTIONS,
              onChange: handleStatusChange,
              ariaLabel: 'Filter by status',
            },
          ]}
          className="rounded-b-none border-b border-muted/20"
        />

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : hasUsers ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="border-b border-disabled">
                    <th className="f1-m px-4 py-3 text-muted">User</th>
                    <th className="f1-m px-4 py-3 text-muted">Role</th>
                    <th className="f1-m px-4 py-3 text-muted">Date Joined</th>
                    <th className="f1-m px-4 py-3 text-muted">Status</th>
                    <th className="f1-m px-4 py-3 text-muted">Last Active</th>
                    <th className="f1-m px-4 py-3 text-right text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const roleMeta = ROLE_META[u.role];
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-disabled last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                              {(u.fullName || u.email).charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="b2-m truncate text-text">
                                {u.fullName || '—'}
                                {isSelf && (
                                  <span className="f1-r text-muted">
                                    {' '}
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="f1-r truncate text-muted">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <AppPill
                            label={roleMeta.label}
                            color={roleMeta.color}
                            border
                            icon={roleMeta.icon}
                          />
                        </td>
                        <td className="b2-r px-4 py-3 text-text-secondary">
                          {formatJoinedDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <AppPill
                            label={u.isActive ? 'Active' : 'Suspended'}
                            color={u.isActive ? 'success' : 'error'}
                          />
                        </td>
                        <td className="b2-r px-4 py-3 text-muted">—</td>
                        <td className="px-4 py-3 text-right">
                          <AppButton
                            href={`/admin/users/${u.id}`}
                            variant="text"
                            color="neutral"
                            size="icon"
                            ariaLabel={`View details for ${u.fullName || u.email}`}
                            className="!h-8 !w-8 !text-muted hover:!bg-primary-light hover:!text-primary"
                          >
                            <ChevronRight size={18} />
                          </AppButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-disabled px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="b2-r text-text-secondary">
                Showing {rangeStart}–{rangeEnd} of {filteredUsers.length} users
              </p>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onChange={setPage}
                className="flex-wrap"
              />
            </div>
          </>
        ) : (
          <AppEmptyState
            image={noUsersImg}
            title={users.length === 0 ? 'No users yet' : 'No matching users'}
            description={
              users.length === 0
                ? 'Invite a Trainer or Mentor to start building your KodeBuddy community.'
                : 'Try adjusting your search or filters.'
            }
          />
        )}
      </AppCard>
    </div>
  );
}
