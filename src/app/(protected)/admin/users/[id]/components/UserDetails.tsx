'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Mail,
  Shield,
  User as UserIcon,
  Users,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import AppInfoCard from '@/components/ui/AppInfoCard';
import AppActionsCard from '@/components/ui/AppActionsCard';
import AppDropdown from '@/components/ui/AppDropdown';
import AppPill from '@/components/ui/AppPill';
import AppButton from '@/components/ui/AppButton';
import AppSpinner from '@/components/ui/AppSpinner';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import { useToast } from '@/components/ui/ToastProvider';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import { useAvailableCourses } from '@/lib/onboarding/useAvailableCourses';
import * as profileApi from '@/lib/api/profile.api';
import { assignLearnerToCourse } from '@/lib/api/courses.api';
import { assignCohortLearner } from '@/lib/api/cohorts.api';
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

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const { courses: availableCourses, loading: coursesLoading } =
    useAvailableCourses();

  useEffect(() => {
    let cancelled = false;
    profileApi
      .getUserById(userId)
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setSelectedRole(u.role);
        setSelectedStatus(u.isActive ? 'active' : 'suspended');
        setSelectedCourseId(u.courseId);
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

  const courseDirty = selectedCourseId !== user.courseId;
  const currentCourseTitle = availableCourses.find(
    (c) => c.id === user.courseId,
  )?.title;

  const displayName = user.fullName || user.email;

  const handleSaveCourse = async () => {
    if (!selectedCourseId || !courseDirty) return;
    setCourseSaving(true);
    try {
      const targetCourse = availableCourses.find(
        (c) => c.id === selectedCourseId,
      );

      if (targetCourse) {
        await assignCohortLearner(targetCourse.cohortId, user.id);
      }
      await assignLearnerToCourse(selectedCourseId, user.id);
      setUser({ ...user, courseId: selectedCourseId });
      showSuccess(
        'Course updated successfully.',
        `${displayName} is now enrolled in ${targetCourse?.title ?? 'the selected course'}.`,
      );
    } catch (err) {
      showError(
        'Could not change course',
        getErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setCourseSaving(false);
      setCourseModalOpen(false);
    }
  };

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

  const infoHeader = (
    <div className="flex items-center gap-3">
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
  );

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
        <AppInfoCard
          title="User Information"
          header={infoHeader}
          fields={[
            { icon: UserIcon, label: 'Full name', value: displayName },
            {
              icon: Mail,
              label: 'Email address',
              value: (
                <a
                  href={`mailto:${user.email}`}
                  className="text-primary hover:underline"
                >
                  {user.email}
                </a>
              ),
            },
            {
              icon: Shield,
              label: 'Role',
              value: (
                <AppPill
                  label={ROLE_LABEL[user.role]}
                  color={ROLE_PILL_COLOR[user.role]}
                  border
                />
              ),
            },
            {
              icon: Users,
              label: 'Account status',
              value: (
                <AppPill
                  label={user.isActive ? 'Active' : 'Suspended'}
                  color={user.isActive ? 'success' : 'error'}
                />
              ),
            },
            {
              icon: Calendar,
              label: 'Date joined',
              value: formatDate(user.createdAt),
            },
            { icon: Clock, label: 'Last active', value: '—' },
            ...(user.role === 'learner'
              ? [
                  {
                    icon: BookOpen,
                    label: 'Enrolled course',
                    value: currentCourseTitle ?? 'Not selected yet',
                  },
                ]
              : []),
          ]}
        />

        <AppActionsCard
          title="Admin actions"
          emptyState={
            isSelf ? (
              <p className="b2-r text-muted">
                You can&apos;t change your own role or account status from here.
              </p>
            ) : undefined
          }
          sections={[
            {
              icon: Users,
              iconVariant: 'primary',
              title: 'Change role',
              description: "Update the user's role on the platform.",
              control: canEditRole ? (
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
              ),
            },
            {
              icon: Users,
              iconVariant: 'warning',
              title: 'Change account status',
              description: "Update the user's account status.",
              control: (
                <>
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
                </>
              ),
            },
            ...(user.role === 'learner'
              ? [
                  {
                    icon: BookOpen,
                    iconVariant: 'primary' as const,
                    title: 'Change course',
                    description:
                      'Move the learner onto a different admin-created course.',
                    control: coursesLoading ? (
                      <div className="flex items-center py-1">
                        <AppSpinner size={20} />
                      </div>
                    ) : availableCourses.length === 0 ? (
                      <p className="f1-r text-muted">
                        No active courses exist yet.
                      </p>
                    ) : (
                      <>
                        <label className="f1-m mb-1.5 block text-text-secondary">
                          Select course
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <AppDropdown
                            value={
                              selectedCourseId ? String(selectedCourseId) : ''
                            }
                            options={availableCourses.map((c) => ({
                              label: c.title,
                              value: String(c.id),
                            }))}
                            onChange={(value) =>
                              setSelectedCourseId(Number(value))
                            }
                            ariaLabel="Select course"
                            placeholder="Choose a course"
                            className="w-full flex-1"
                          />
                          <AppButton
                            size="small"
                            radius="full"
                            disabled={!courseDirty || courseSaving}
                            onClick={() => setCourseModalOpen(true)}
                          >
                            Save
                          </AppButton>
                        </div>
                      </>
                    ),
                  },
                ]
              : []),
          ]}
          hint="You can review your changes before confirming. Suspended users cannot log in or access the platform until reactivated."
          showFooterActions={!isSelf && isDirty}
          onCancel={handleCancel}
          onConfirm={handleConfirmClick}
        />
      </div>

      <AppConfirmModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <BookOpen size={28} className="text-primary" />
          </span>
        }
        title="Change course?"
        description={`This will move ${displayName} onto ${
          availableCourses.find((c) => c.id === selectedCourseId)?.title ??
          'the selected course'
        }.`}
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setCourseModalOpen(false),
        }}
        primaryButton={{
          label: 'Change course',
          loading: courseSaving,
          onClick: handleSaveCourse,
        }}
      />

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
