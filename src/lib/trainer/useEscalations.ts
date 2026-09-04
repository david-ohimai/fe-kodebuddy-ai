'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { listTrainerEscalations } from '@/lib/api/chat.api';
import * as profileApi from '@/lib/api/profile.api';
import { getErrorMessage } from '@/lib/api/client';
import type { Escalation } from '@/types/chat.types';

export function useEscalations() {
  const { showError } = useToast();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // EscalationResponse has no learner name/email, only learner_id — see
    // chat.types.ts. Joined against the user list the same way submission
    // and cohort-roster views resolve names elsewhere in this app.
    Promise.all([listTrainerEscalations(), profileApi.listUsers()])
      .then(([items, users]) => {
        const usersById = new Map(users.map((u) => [u.id, u]));
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
        showError(
          'Could not load escalations',
          getErrorMessage(err, 'Please try again.'),
        );
        setEscalations([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { escalations, loading, refresh: load };
}
