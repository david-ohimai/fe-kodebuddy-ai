'use client';

import { useEffect, useState } from 'react';
import { getEscalation, respondToEscalation } from '@/lib/api/chat.api';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import type { Escalation } from '@/types/chat.types';

export function useEscalationDetail(escalationId: number) {
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setNotFound(false);
    getEscalation(escalationId)
      .then(async (result) => {
        if (!result) {
          setNotFound(true);
          return;
        }
        // Same name-resolution gap as the list view — see useEscalations.ts.
        const learner = await profileApi
          .getUserById(result.learnerId)
          .catch(() => null);
        setEscalation({
          ...result,
          learnerName: learner?.fullName || learner?.email || null,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escalationId]);

  const sendResponse = async (message: string) => {
    if (!message.trim() || sending) return false;
    setSending(true);
    setSendError(null);
    try {
      await respondToEscalation({ escalationId, message: message.trim() });
      // EscalationResponse doesn't echo the reply back (see chat.types.ts),
      // so this is set optimistically for the rest of this session rather
      // than read back from the server.
      setEscalation((prev) =>
        prev
          ? {
              ...prev,
              status: 'resolved',
              response: message.trim(),
              respondedAt: new Date().toISOString(),
            }
          : prev,
      );
      return true;
    } catch (err) {
      setSendError(
        getErrorMessage(err, 'Unable to send response. Please try again.'),
      );
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    escalation,
    loading,
    notFound,
    sending,
    sendError,
    sendResponse,
    refresh: load,
  };
}
