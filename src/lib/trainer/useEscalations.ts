'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { listTrainerEscalations, isChatMocked } from '@/lib/api/chat.api';
import { getErrorMessage } from '@/lib/api/client';
import type { Escalation } from '@/types/chat.types';

export function useEscalations() {
  const { showError } = useToast();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listTrainerEscalations()
      .then(setEscalations)
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

  return { escalations, loading, isMocked: isChatMocked(), refresh: load };
}
