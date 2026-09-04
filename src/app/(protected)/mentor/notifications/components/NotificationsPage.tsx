'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import AppButton from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppSpinner from '@/components/ui/AppSpinner';
import AppTab from '@/components/ui/AppTab';
import MentorNotificationModal from './MentorNotificationModal';
import { useMentorNotifications } from '@/lib/mentor/useMentorNotifications';
import { cx } from '@/lib/utils/cx';
import {
  formatRelativeTime,
  type MentorNotification,
} from '@/types/notification.types';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
] as const;

const NOTIFICATION_ICON = {
  warning: AlertTriangle,
  success: CheckCircle2,
  neutral: MessageCircle,
} as const;

const ICON_CLASSES = {
  warning: 'bg-warning-light text-warning-dark',
  success: 'bg-success-light text-success-dark',
  neutral: 'bg-disabled text-muted',
} as const;

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all');
  const { notifications: remoteNotifications, loading } = useMentorNotifications();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [selectedNotification, setSelectedNotification] =
    useState<MentorNotification | null>(null);

  const notifications = useMemo(
    () =>
      remoteNotifications.map((notification) => ({
        ...notification,
        read: notification.read || readIds.has(notification.id),
      })),
    [readIds, remoteNotifications],
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visibleNotifications = useMemo(
    () =>
      activeTab === 'unread'
        ? notifications.filter((notification) => !notification.read)
        : notifications,
    [activeTab, notifications],
  );

  const markAllAsRead = () => {
    setReadIds((current) => {
      const next = new Set(current);
      notifications.forEach((notification) => next.add(notification.id));
      return next;
    });
  };

  const markAsRead = (id: string) => {
    setReadIds((current) => new Set(current).add(id));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="h5-b text-text">{unreadCount} New updates</h1>
          <p className="b2-r mt-1 text-text-secondary">
            Activity from the learners assigned to you.
          </p>
        </div>
        <AppButton
          size="small"
          radius="full"
          startIcon={<CheckCircle2 size={16} />}
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </AppButton>
      </div>

      <AppCard padding="none" className="overflow-hidden">
        <AppTab
          tabs={TABS}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as (typeof TABS)[number]['id'])}
          variant="underline"
          ariaLabel="Notification filters"
          className="border-0 px-5 pt-2 sm:px-6"
        />

        {loading ? (
          <div className="flex min-h-48 items-center justify-center border-t border-disabled">
            <AppSpinner size={36} />
          </div>
        ) : visibleNotifications.length === 0 ? (
          <AppEmptyState
            icon={<Bell />}
            title="You’re all caught up"
            description="There are no unread updates from your learners."
            size="compact"
            className="min-h-80 border-t border-disabled"
          />
        ) : (
          <ul className="flex flex-col gap-1.5 border-t border-disabled bg-background p-2 sm:p-3">
            {visibleNotifications.map((notification) => {
              const Icon = NOTIFICATION_ICON[notification.tone];
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(notification.id);
                      setSelectedNotification(notification);
                    }}
                    className={cx(
                      'flex w-full items-start gap-3 rounded-input border px-3 py-2.5 text-left transition-colors sm:gap-4 sm:px-4',
                      notification.read
                        ? 'border-disabled bg-background hover:bg-primary-light/30'
                        : 'border-disabled bg-disabled/60 hover:bg-primary-light/50',
                    )}
                  >
                    <span
                      className={cx(
                        'mt-2 h-2 w-2 shrink-0 rounded-full',
                        notification.read ? 'bg-transparent' : 'bg-primary',
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cx(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-input',
                        ICON_CLASSES[notification.tone],
                      )}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cx(
                          'block b2-m text-text',
                          notification.read && 'font-normal text-text-secondary',
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block truncate f1-r text-muted">
                        {notification.subject}
                      </span>
                    </span>
                    <span className="shrink-0 pt-1 f1-r text-muted">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </AppCard>

      <MentorNotificationModal
        notification={selectedNotification}
        open={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        onSent={() => markAsRead(selectedNotification?.id ?? '')}
      />
    </div>
  );
}
