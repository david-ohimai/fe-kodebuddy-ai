'use client';

import { useEffect, useState } from 'react';
import { listCohorts, type Cohort } from '@/lib/api/cohorts.api';

export function useAvailableCohorts() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCohorts()
      .then((all) => {
        if (cancelled) return;
        const openCohorts = all.filter((c) => c.isOpen);
        const current = openCohorts.reduce<Cohort | null>(
          (latest, c) => (!latest || c.id > latest.id ? c : latest),
          null,
        );
        setCohort(current);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load the current cohort.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { cohort, loading, error };
}
