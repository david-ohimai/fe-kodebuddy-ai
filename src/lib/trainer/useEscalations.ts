'use client';

import { useCallback, useEffect, useState } from 'react';
import * as chatApi from '@/lib/api/chat.api';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import type { AuthUser } from '@/types/auth.types';
import type { Escalation } from '@/types/chat.types';

export function useEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    chatApi
      .listTrainerEscalations()
      .then(async (items) => {
        // EscalationResponse only carries learner_id, no name/email — see
        // chat.types.ts. Resolved per learner (GET /profile/users/{id})
        // rather than the bulk GET /profile/users list, which is
        // admin-only: a trainer fetching their own assigned escalations
        // was getting the whole list wiped out by a 403 on that one bulk
        // name lookup. Each lookup is caught independently so a missing or
        // denied profile just falls back to "Unknown learner" instead of
        // hiding every escalation.
        const learnerIds = [...new Set(items.map((e) => e.learnerId))];
        const users = await Promise.all(
          learnerIds.map((id) =>
            profileApi.getUserById(id).catch((err) => {
              console.warn(
                `[escalations] GET /profile/users/${id} failed — showing this escalation as "Unknown learner".`,
                err,
              );
              return null;
            }),
          ),
        );
        const usersById = new Map(
          users.filter((u): u is AuthUser => u !== null).map((u) => [u.id, u]),
        );

        setEscalations(
          items.map((e) => {
            const learner = usersById.get(e.learnerId);
            return {
              ...e,
              learnerName: learner?.fullName || learner?.email || null,
            };
          }),
        );
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, 'Please try again.'));
        setEscalations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { escalations, loading, error, refresh: load };
}
