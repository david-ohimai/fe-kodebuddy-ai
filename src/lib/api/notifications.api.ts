import { apiFetch } from './client';
import type { AppNotification } from '@/types/notification.types';

/**
 * Every value NotificationType can hold on the backend. They are all
 * escalation lifecycle events today; the union is kept open-ended because the
 * server may add more before the client does.
 */
export type NotificationTypeDto =
  | 'escalation_created'
  | 'escalation_updated'
  | 'escalation_resolved'
  | 'escalation_assigned'
  | (string & {});

interface NotificationResponseDto {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: NotificationTypeDto;
  /** What the notification points at, e.g. "escalation". */
  related_entity_type: string | null;
  related_entity_id: number | null;
  is_read: boolean;
  created_at: string;
}

function mapNotification(dto: NotificationResponseDto): AppNotification {
  return {
    id: String(dto.id),
    // The backend's types are all escalation events; anything unrecognised
    // renders as a plain notification rather than being dropped.
    kind: dto.notification_type.startsWith('escalation')
      ? 'escalation_reply'
      : 'general',
    title: dto.title,
    subject: dto.message,
    createdAt: dto.created_at,
    read: dto.is_read,
    relatedEntityType: dto.related_entity_type,
    relatedEntityId: dto.related_entity_id,
  };
}

/**
 * The signed-in learner's notifications, newest first.
 *
 * Learner-scoped on the server via `get_current_learner` — there is no way to
 * request another user's. Trainers have their own `/notifications/trainer`.
 */
export async function listMyNotifications(
  limit = 50,
): Promise<AppNotification[]> {
  const dtos = await apiFetch<NotificationResponseDto[]>(
    `/notifications/learner?limit=${limit}`,
    { method: 'GET', auth: true },
  );
  return (dtos ?? []).map(mapNotification);
}

export async function markNotificationRead(
  notificationId: string,
): Promise<AppNotification> {
  const dto = await apiFetch<NotificationResponseDto>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH', auth: true, body: { is_read: true } },
  );
  return mapNotification(dto);
}
