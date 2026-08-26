'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import TableHeader from '@/components/ui/AppTableHeader';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import noUsersImg from '@/assets/images/no-users.webp';
import type { AuthUser, UserRole } from '@/types/auth.types';

const ROLE_OPTIONS = [
  { label: 'All Role', value: '' },
  { label: 'Learner', value: 'learner' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Admin', value: 'admin' },
];

const ROLE_CHANGE_OPTIONS = ROLE_OPTIONS.filter((option) => option.value);

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

function formatJoinedDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function UsersPage() {
  const { user: currentUser } = useCurrentUser();
  const { showError, showSuccess } = useToast();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

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

  const handleRoleChange = async (targetUser: AuthUser, nextRole: string) => {
    if (!nextRole || nextRole === targetUser.role) return;

    setUpdatingUserId(targetUser.id);
    const previousUsers = users;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id ? { ...u, role: nextRole as UserRole } : u,
      ),
    );

    try {
      await profileApi.updateUserRole(targetUser.id, nextRole as UserRole);
      showSuccess(
        'Role updated',
        `${targetUser.fullName || targetUser.email} is now ${nextRole}.`,
      );
    } catch (err) {
      setUsers(previousUsers);
      showError(
        'Could not update role',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const hasUsers = filteredUsers.length > 0;

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

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <AppSpinner size={40} />
          </div>
        ) : hasUsers ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-disabled">
                  <th className="f1-m px-4 py-3 text-muted">Name</th>
                  <th className="f1-m px-4 py-3 text-muted">Email</th>
                  <th className="f1-m px-4 py-3 text-muted">Role</th>
                  <th className="f1-m px-4 py-3 text-muted">Status</th>
                  <th className="f1-m px-4 py-3 text-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isUpdating = updatingUserId === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-disabled last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light b2-b text-primary">
                            {(u.fullName || u.email).charAt(0).toUpperCase()}
                          </span>
                          <span className="b2-m text-text">
                            {u.fullName || '—'}
                            {isSelf && (
                              <span className="f1-r text-muted"> (You)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="b2-r px-4 py-3 text-text-secondary">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf || isUpdating}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          aria-label={`Change role for ${u.email}`}
                          className="b2-m appearance-none rounded-input border border-disabled bg-background py-1.5 pl-2.5 pr-7 text-text disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ROLE_CHANGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <AppPill
                          label={u.isActive ? 'Active' : 'Inactive'}
                          color={u.isActive ? 'success' : 'default'}
                        />
                      </td>
                      <td className="b2-r px-4 py-3 text-text-secondary">
                        {formatJoinedDate(u.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
