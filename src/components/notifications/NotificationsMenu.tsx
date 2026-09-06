'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { cx } from '@/lib/utils/cx';
import {
  listMyNotifications,
  listTrainerNotifications,
  listGenericNotifications,
  markNotificationRead,
} from '@/lib/api/notifications.api';
import { useCurrentUserContext } from '@/lib/auth/CurrentUserContext';
import {
  formatRelativeTime,
  type AppNotification,
} from '@/types/notification.types';

const PREVIEW_LIMIT = 5;

export interface NotificationsMenuProps {
  className?: string;
}

export default function NotificationsMenu({
  className,
}: NotificationsMenuProps) {
  const { user } = useCurrentUserContext();
  const router = useRouter();
  const role = user?.role;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchNotifications =
      user?.role === 'trainer'
        ? listTrainerNotifications
        : user?.role === 'learner'
          ? listMyNotifications
          : listGenericNotifications;

    fetchNotifications()
      .then((list) => {
        if (!cancelled) setNotifications(list);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open, user?.role]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const preview = notifications.slice(0, PREVIEW_LIMIT);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    await Promise.allSettled(unread.map((n) => markNotificationRead(n.id)));
  }, [notifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    try {
      await markNotificationRead(id);
    } catch {}
  }, []);

  /**
   * Marks the notification read, then follows it to whatever it refers to.
   *
   * `related_entity_type` / `related_entity_id` are the server's own pointer.
   * Escalations are the only kind it emits today, and the destination differs
   * by role — a trainer answers them, a learner reads the answer. A
   * notification with no destination just marks read and closes, as before.
   */
  const openNotification = useCallback(
    (notification: AppNotification) => {
      void markRead(notification.id);
      setOpen(false);

      if (
        notification.relatedEntityType !== 'escalation' ||
        notification.relatedEntityId == null
      ) {
        return;
      }

      router.push(
        role === 'trainer'
          ? `/trainer/escalations/${notification.relatedEntityId}`
          : `/assignments/escalations/${notification.relatedEntityId}`,
      );
    },
    [markRead, role, router],
  );

  return (
    <div className={cx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-input border border-disabled text-text-secondary transition-colors hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-error px-1 f2-b text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            role="presentation"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
          />

          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-disabled bg-background shadow-lg"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <h2 className="h6-b text-text">Notifications</h2>
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="b2-m text-primary transition-colors hover:underline disabled:text-muted disabled:no-underline"
              >
                Mark all read
              </button>
            </div>

            {preview.length === 0 ? (
              <p className="border-t border-disabled px-5 py-8 text-center b2-r text-muted">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="max-h-96 overflow-y-auto border-t border-disabled">
                {preview.map((notification) => (
                  <li
                    key={notification.id}
                    className="border-b border-disabled last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-primary-light/40"
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                          notification.read ? 'bg-transparent' : 'bg-primary',
                        )}
                      />

                      <span className="min-w-0 flex-1">
                        <span
                          className={cx(
                            'block',
                            notification.read
                              ? 'b1-r text-text-secondary'
                              : 'b1-b text-text',
                          )}
                        >
                          {notification.title}
                        </span>
                        <span className="mt-0.5 block b2-r text-text-secondary">
                          {notification.subject}
                        </span>
                        <span className="mt-1 block f1-r text-muted">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>

                      <ChevronRight
                        size={18}
                        className="mt-1 shrink-0 text-muted"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-disabled px-5 py-3.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="b2-m text-primary transition-colors hover:underline"
              >
                View all notification
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
