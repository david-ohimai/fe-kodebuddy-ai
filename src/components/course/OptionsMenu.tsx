'use client';

import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export interface OptionsMenuProps {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  viewLabel?: string;
  onView?: () => void;
}

export default function OptionsMenu({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  viewLabel,
  onView,
}: OptionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Options"
        className="text-muted hover:text-text"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-disabled bg-background py-1 shadow-lg">
            {viewLabel && onView && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onView();
                }}
                className="b2-r w-full px-3.5 py-2 text-left text-text hover:bg-primary-light"
              >
                {viewLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="b2-r w-full px-3.5 py-2 text-left text-text hover:bg-primary-light"
            >
              {editLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="b2-r w-full px-3.5 py-2 text-left text-error hover:bg-error-light"
            >
              {deleteLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
