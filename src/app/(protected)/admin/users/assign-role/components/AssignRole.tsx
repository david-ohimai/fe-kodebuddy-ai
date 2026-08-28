'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, UserCheck } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppSearchSelect from '@/components/ui/AppSearchSelect';
import AppDropdown from '@/components/ui/AppDropdown';
import AppPill from '@/components/ui/AppPill';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import type { AuthUser, UserRole } from '@/types/auth.types';

const ROLE_LABEL: Record<UserRole, string> = {
  learner: 'Learner',
  trainer: 'Trainer',
  mentor: 'Mentor',
  admin: 'Admin',
};

const ROLE_PILL_COLOR: Record<
  UserRole,
  'primary' | 'success' | 'warning' | 'secondary'
> = {
  learner: 'primary',
  trainer: 'success',
  mentor: 'warning',
  admin: 'secondary',
};

const ROLE_OPTIONS = [
  { label: 'Learner', value: 'learner' },
  { label: 'Trainer', value: 'trainer' },
  { label: 'Mentor', value: 'mentor' },
];

export default function AssignRole() {
  const { user: currentUser } = useCurrentUserContext();
  const { showError } = useToast();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assignedUser, setAssignedUser] = useState<AuthUser | null>(null);

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
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const assignableUsers = users.filter(
    (u) => u.id !== currentUser?.id && u.role !== 'admin',
  );

  const userOptions = assignableUsers.map((u) => ({
    value: String(u.id),
    label: u.fullName || u.email,
    description: `${u.email} · Currently ${ROLE_LABEL[u.role]}`,
  }));

  const selectedUser = assignableUsers.find(
    (u) => String(u.id) === selectedUserId,
  );

  const canSubmit =
    !!selectedUser && !!selectedRole && selectedRole !== selectedUser.role;

  const handleConfirm = async () => {
    if (!selectedUser || !selectedRole) return;
    setSubmitting(true);
    try {
      const updated = await profileApi.updateUserRole(
        selectedUser.id,
        selectedRole as UserRole,
      );
      setAssignedUser(updated);
      setConfirmOpen(false);
    } catch (err) {
      showError(
        'Could not assign role',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAssignedUser(null);
    setSelectedUserId('');
    setSelectedRole('');
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/admin/users"
        className="b2-b mb-6 inline-flex items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to users
      </Link>

      <AppCard padding="lg">
        {assignedUser ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
              <UserCheck size={28} className="text-success-dark" />
            </span>

            <h1 className="h5-b text-text">Role updated successfully!</h1>
            <p className="b2-r mt-1 text-muted">
              {assignedUser.fullName || assignedUser.email}&apos;s role has been
              changed to {ROLE_LABEL[assignedUser.role]}.
            </p>

            <div className="mt-6 w-full max-w-sm divide-y divide-disabled rounded-input border border-disabled text-left">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="b2-r text-muted">Name</span>
                <span className="b2-m text-text">
                  {assignedUser.fullName || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="b2-r text-muted">Email</span>
                <span className="b2-m text-text">{assignedUser.email}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="b2-r text-muted">New role</span>
                <AppPill
                  label={ROLE_LABEL[assignedUser.role]}
                  color={ROLE_PILL_COLOR[assignedUser.role]}
                  border
                />
              </div>
            </div>

            <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <AppButton
                href="/admin/users"
                variant="outlined"
                color="neutral"
                radius="full"
                fullWidth
                className="sm:w-auto"
              >
                Back to users
              </AppButton>
              <AppButton
                radius="full"
                fullWidth
                className="sm:w-auto"
                onClick={resetForm}
              >
                Assign another role
              </AppButton>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="h5-b text-text">Assign a role</h1>
              <p className="b2-r mt-1 text-muted">
                Search for an existing KodeBuddy user and update their role —
                for example, promoting a Learner to Trainer or Mentor.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="b2-m text-text">User</label>
                <AppSearchSelect
                  value={selectedUserId}
                  options={userOptions}
                  onChange={(value) => {
                    setSelectedUserId(value);
                    setSelectedRole('');
                  }}
                  loading={loadingUsers}
                  placeholder="Search by name or email"
                  searchPlaceholder="Type a name or email..."
                  emptyMessage={
                    loadingUsers
                      ? 'Loading users...'
                      : 'No other users to assign roles to yet.'
                  }
                  ariaLabel="Select user"
                />
              </div>

              {selectedUser && (
                <>
                  <div className="flex items-center gap-2 rounded-input bg-primary-light px-4 py-3">
                    <span className="b2-r text-primary-dark">
                      Current role:
                    </span>
                    <AppPill
                      label={ROLE_LABEL[selectedUser.role]}
                      color={ROLE_PILL_COLOR[selectedUser.role]}
                      border
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="b2-m text-text">Assign new role</label>
                    <AppDropdown
                      value={selectedRole}
                      options={ROLE_OPTIONS}
                      onChange={setSelectedRole}
                      placeholder="Select a role"
                      ariaLabel="Assign new role"
                    />
                  </div>
                </>
              )}

              <div className="mt-2 flex flex-col-reverse items-center gap-3 pt-2 sm:flex-row sm:justify-end">
                <AppButton
                  href="/admin/users"
                  variant="outlined"
                  color="neutral"
                  radius="full"
                  fullWidth
                  className="sm:w-auto"
                >
                  Cancel
                </AppButton>
                <AppButton
                  type="button"
                  radius="full"
                  fullWidth
                  className="sm:w-auto"
                  disabled={!canSubmit}
                  onClick={() => setConfirmOpen(true)}
                >
                  Assign role
                </AppButton>
              </div>
            </div>
          </>
        )}
      </AppCard>

      <AppConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
            <ShieldAlert size={28} className="text-warning" />
          </span>
        }
        title="Change user role?"
        description={
          selectedUser && selectedRole
            ? `This will update ${selectedUser.fullName || selectedUser.email}'s permissions and access to match the ${ROLE_LABEL[selectedRole as UserRole]} role.`
            : undefined
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Change role',
          loading: submitting,
          onClick: handleConfirm,
        }}
      />
    </div>
  );
}
