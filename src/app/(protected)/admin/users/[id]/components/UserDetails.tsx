'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Shield,
  User as UserIcon,
  Users,
  AlertTriangle,
  X,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppButton from '@/components/ui/AppButton';
import AppDropdown from '@/components/ui/AppDropdown';
import AppPill from '@/components/ui/AppPill';
import AppSpinner from '@/components/ui/AppSpinner';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import type { AuthUser, UserRole } from '@/types/auth.types';

export interface UserDetailsProps {
  userId: number;
}

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

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type ModalKind = 'role' | 'suspend' | 'reactivate' | 'both' | null;

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="b2-r flex items-center gap-2 text-text-secondary">
        <Icon size={16} className="shrink-0 text-muted" />
        {label}
      </span>
      <span className="b2-m text-right text-text">{children}</span>
    </div>
  );
}

export default function UserDetails({ userId }: UserDetailsProps) {
  const { user: currentUser } = useCurrentUserContext();
  const { showError, showSuccess } = useToast();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'suspended'>(
    'active',
  );
  const [modal, setModal] = useState<ModalKind>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    profileApi
      .getUserById(userId)
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setSelectedRole(u.role);
        setSelectedStatus(u.isActive ? 'active' : 'suspended');
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size={40} />
      </div>
    );
  }

  if (notFound || !user || selectedRole === null) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/users"
          className="b2-b inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to users
        </Link>
        <AppCard padding="lg" className="text-center">
          <p className="b1-b text-text">User not found</p>
          <p className="b2-r mt-1 text-muted">
            This user may have been removed, or the link is incorrect.
          </p>
        </AppCard>
      </div>
    );
  }

  const isSelf = currentUser?.id === user.id;
  const canEditRole = !isSelf && user.role !== 'admin';

  const roleDirty = selectedRole !== user.role;
  const statusDirty =
    selectedStatus !== (user.isActive ? 'active' : 'suspended');
  const isDirty = roleDirty || statusDirty;

  const displayName = user.fullName || user.email;

  const handleCancel = () => {
    setSelectedRole(user.role);
    setSelectedStatus(user.isActive ? 'active' : 'suspended');
  };

  const handleConfirmClick = () => {
    if (roleDirty && statusDirty) setModal('both');
    else if (roleDirty) setModal('role');
    else if (statusDirty)
      setModal(selectedStatus === 'suspended' ? 'suspend' : 'reactivate');
  };

  const applyChanges = async () => {
    setSaving(true);
    try {
      let nextUser = user;

      if (roleDirty) {
        nextUser = await profileApi.updateUserRole(user.id, selectedRole);
      }

      if (statusDirty) {
        nextUser = { ...nextUser, isActive: selectedStatus === 'active' };
      }

      setUser(nextUser);
      setSelectedRole(nextUser.role);
      setSelectedStatus(nextUser.isActive ? 'active' : 'suspended');

      const messages: string[] = [];
      if (roleDirty)
        messages.push(
          `${displayName}'s role has been changed to ${ROLE_LABEL[selectedRole]}.`,
        );
      if (statusDirty) {
        messages.push(
          selectedStatus === 'suspended'
            ? `${displayName} has been suspended.`
            : `${displayName} has been reactivated.`,
        );
      }
      showSuccess('User updated successfully.', messages.join(' '));
    } catch (err) {
      showError(
        'Could not update user',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="h5-b text-text">User details</h1>
        <Link
          href="/admin/users"
          className="b2-b mt-1 inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to users
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AppCard padding="md">
          <h2 className="b1-b mb-4 text-text">User Information</h2>

          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light h4-b text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="b1-b truncate text-text">{displayName}</p>
              <p className="f1-r truncate text-muted">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <AppPill
                  label={ROLE_LABEL[user.role]}
                  color={ROLE_PILL_COLOR[user.role]}
                  border
                />
                <AppPill
                  label={user.isActive ? 'Active' : 'Suspended'}
                  color={user.isActive ? 'success' : 'error'}
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-disabled border-t border-disabled">
            <InfoRow icon={UserIcon} label="Full name">
              {displayName}
            </InfoRow>
            <InfoRow icon={Mail} label="Email address">
              <a
                href={`mailto:${user.email}`}
                className="text-primary hover:underline"
              >
                {user.email}
              </a>
            </InfoRow>
            <InfoRow icon={Shield} label="Role">
              <AppPill
                label={ROLE_LABEL[user.role]}
                color={ROLE_PILL_COLOR[user.role]}
                border
              />
            </InfoRow>
            <InfoRow icon={Users} label="Account status">
              <AppPill
                label={user.isActive ? 'Active' : 'Suspended'}
                color={user.isActive ? 'success' : 'error'}
              />
            </InfoRow>
            <InfoRow icon={Calendar} label="Date joined">
              {formatDate(user.createdAt)}
            </InfoRow>
            <InfoRow icon={Clock} label="Last active">
              —
            </InfoRow>
          </div>
        </AppCard>

        <AppCard padding="md">
          <h2 className="b1-b mb-4 text-text">Admin actions</h2>

          {isSelf ? (
            <p className="b2-r text-muted">
              You can&apos;t change your own role or account status from here.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-3 flex items-start gap-3">
                  <AppCard.Icon variant="primary">
                    <Users />
                  </AppCard.Icon>
                  <div>
                    <p className="b2-b text-text">Change role</p>
                    <p className="f1-r text-muted">
                      Update the user&apos;s role on the platform.
                    </p>
                  </div>
                </div>

                {canEditRole ? (
                  <>
                    <label className="f1-m mb-1.5 block text-text-secondary">
                      Select role
                    </label>
                    <AppDropdown
                      value={selectedRole}
                      options={ROLE_OPTIONS}
                      onChange={(value) => setSelectedRole(value as UserRole)}
                      ariaLabel="Select role"
                      className="w-full"
                    />
                  </>
                ) : (
                  <p className="f1-r text-muted">
                    Admin roles can&apos;t be changed from this page.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-start gap-3">
                  <AppCard.Icon variant="warning">
                    <Users />
                  </AppCard.Icon>
                  <div>
                    <p className="b2-b text-text">Change account status</p>
                    <p className="f1-r text-muted">
                      Update the user&apos;s account status.
                    </p>
                  </div>
                </div>

                <label className="f1-m mb-1.5 block text-text-secondary">
                  Select status
                </label>
                <AppDropdown
                  value={selectedStatus}
                  options={STATUS_OPTIONS}
                  onChange={(value) =>
                    setSelectedStatus(value as 'active' | 'suspended')
                  }
                  ariaLabel="Select status"
                  className="w-full"
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-input bg-primary-light px-4 py-3">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-primary" />
                <p className="f1-r text-primary-dark">
                  You can review your changes before confirming. Suspended users
                  cannot log in or access the platform until reactivated.
                </p>
              </div>

              {isDirty && (
                <div className="flex items-center gap-2">
                  <AppButton
                    variant="outlined"
                    color="neutral"
                    radius="full"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </AppButton>
                  <AppButton
                    radius="full"
                    onClick={handleConfirmClick}
                    className="flex-1"
                  >
                    Confirm change
                  </AppButton>
                </div>
              )}
            </div>
          )}
        </AppCard>
      </div>

      <AppConfirmModal
        open={modal === 'role'}
        onClose={() => setModal(null)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
            <AlertTriangle size={28} className="text-warning" />
          </span>
        }
        title="Change user role?"
        description={`This will update ${displayName}'s permissions and access to match the ${ROLE_LABEL[selectedRole]} role.`}
        secondaryButton={{ label: 'Cancel', onClick: () => setModal(null) }}
        primaryButton={{
          label: 'Change role',
          loading: saving,
          onClick: applyChanges,
        }}
      />

      <AppConfirmModal
        open={modal === 'suspend'}
        onClose={() => setModal(null)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-error">
            <X size={30} strokeWidth={3} className="text-white" />
          </span>
        }
        title="Suspend user?"
        description="Suspended users will no longer be able to log in or access KodeBuddy until their account is reactivated."
        secondaryButton={{ label: 'Cancel', onClick: () => setModal(null) }}
        primaryButton={{
          label: 'Suspend user',
          color: 'error',
          loading: saving,
          onClick: applyChanges,
        }}
      />

      <AppConfirmModal
        open={modal === 'reactivate'}
        onClose={() => setModal(null)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
            <CheckCircle2 size={30} className="text-success-dark" />
          </span>
        }
        title="Reactivate user?"
        description={`${displayName} will regain access to KodeBuddy.`}
        secondaryButton={{ label: 'Cancel', onClick: () => setModal(null) }}
        primaryButton={{
          label: 'Reactivate user',
          loading: saving,
          onClick: applyChanges,
        }}
      />

      <AppConfirmModal
        open={modal === 'both'}
        onClose={() => setModal(null)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
            <AlertTriangle size={28} className="text-warning" />
          </span>
        }
        title="Confirm changes?"
        description={`This will update ${displayName}'s role to ${selectedRole ? ROLE_LABEL[selectedRole] : ''} and set their account status to ${selectedStatus === 'active' ? 'Active' : 'Suspended'}.`}
        secondaryButton={{ label: 'Cancel', onClick: () => setModal(null) }}
        primaryButton={{
          label: 'Confirm changes',
          loading: saving,
          onClick: applyChanges,
        }}
      />
    </div>
  );
}
