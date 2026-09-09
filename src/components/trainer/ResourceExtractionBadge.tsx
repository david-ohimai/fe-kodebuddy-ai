'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ExtractionStatus } from '@/lib/api/resources.api';

/**
 * Shows whether a resource actually made it into the AI's search index.
 *
 * The backend runs extraction as a background task after the resource is
 * saved (app/agent/ingestion.py::sync_resource_embeddings) and records the
 * outcome on `content_extract_status`/`content_extract_error`. Without this
 * badge a link that 404s, a PDF that won't parse, or a missing embeddings key
 * all look identical to a healthy resource in the trainer UI — the resource
 * row saves fine, it just silently never grounds any answer.
 */

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  className: string;
  hint: string;
}

const STATUS_META: Record<ExtractionStatus, StatusMeta> = {
  ok: {
    label: 'Indexed for AI',
    icon: CheckCircle2,
    className: 'bg-success-light text-success-dark',
    hint: 'KodeBuddy can use this resource to answer learner questions.',
  },
  partial: {
    label: 'Partially indexed',
    icon: AlertTriangle,
    className: 'bg-warning-light text-warning-dark',
    hint: 'Only part of this resource could be read. KodeBuddy will use what it has.',
  },
  failed: {
    label: 'Not indexed',
    icon: XCircle,
    className: 'bg-error-light text-error',
    hint: 'This resource could not be read, so KodeBuddy cannot use it in answers.',
  },
  pending: {
    label: 'Processing',
    icon: Clock,
    className: 'bg-disabled text-text-secondary',
    hint: 'This resource is still being processed for KodeBuddy. Refresh in a moment.',
  },
};

export interface ResourceExtractionBadgeProps {
  status: ExtractionStatus;
  className?: string;
}

export default function ResourceExtractionBadge({
  status,
  className = '',
}: ResourceExtractionBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <span
      title={meta.hint}
      className={`f1-r inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 ${meta.className} ${className}`}
    >
      <Icon size={12} aria-hidden />
      {meta.label}
    </span>
  );
}

export function getExtractionHint(status: ExtractionStatus): string {
  return STATUS_META[status].hint;
}
