import React from 'react';

export default function SetupLoadingStep() {
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-4 border-secondary-light" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-secondary" />
        <span className="h-9 w-9 rounded-full bg-secondary" />
      </span>

      <div>
        <h1 className="h5-b text-text">
          Setting up your learning experience...
        </h1>
        <p className="b2-r mt-2 text-text-secondary">
          Personalising your recommendations
        </p>
      </div>
    </div>
  );
}
