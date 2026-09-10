'use client';

import { useCallback, useEffect, useState } from 'react';
import * as chatApi from '@/lib/api/chat.api';
import { getErrorMessage } from '@/lib/api/client';
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
      .then(setEscalations)
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
