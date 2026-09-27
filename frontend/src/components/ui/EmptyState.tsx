import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display matching your criteria.',
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`w-full py-16 px-6 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
