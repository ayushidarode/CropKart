import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error communicating with the database.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`w-full py-12 px-6 text-center flex flex-col items-center justify-center bg-rose-50/50 rounded-3xl border border-rose-100 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-rose-950">{title}</h4>
      <p className="text-xs text-rose-800/80 max-w-md mt-1 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
}
